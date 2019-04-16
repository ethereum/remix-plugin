import { PluginDevMode, PluginClient, PluginOptions, listenEvent, callEvent } from './client'
import { Message, ModuleProfile } from '../types'
import { ApiMap, getApiMap, listenOnThemeChanged } from './api'

/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param devMode Devmode options
 */
export function checkOrigin(origin: string, devMode?: PluginDevMode) {
  const localhost = devMode ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  return [
    "http://remix-alpha.ethereum.org",
    "http://remix.ethereum.org",
    "https://remix-alpha.ethereum.org",
    "https://remix.ethereum.org",
    ...localhost
  ].includes(origin)
}

/**
 * Start listening on the IDE though PostMessage
 * @param store A store to put the messages into
 */
export function connectIframe(client: PluginClient) {
  let loaded = false

  async function getMessage(event: MessageEvent) {
    if (!event.source) throw new Error('No source')

    // Check that the origin is the right one
    const devMode = client.devMode
    if (!checkOrigin(event.origin, devMode)) return

    // Get the data
    if (!event.data) throw new Error('No data')
    const { action, key, name, payload, id, requestInfo, error } = event.data as Message
    try {

      // If handshake set loaded
      if (action === 'request' && key === 'handshake') {
        loaded = true
        client.events.emit('loaded')
        client.events.on('send', (message: Message) => {
          (event.source as Window).postMessage(message, event.origin as any)
        })
      }

      // Check if is loaded
      if (!loaded) throw new Error('Handshake before communicating')

      switch (action) {
        case 'notification': {
          client.events.emit(listenEvent(name, key), ...payload)
          break
        }
        case 'response': {
          client.events.emit(callEvent(name, key, id), payload, error)
          break
        }
        case 'request': {
          if (!client[key]) {
            throw new Error(`Method ${key} doesn't exist on plugin ${name}`)
          }
          client.currentRequest = requestInfo
          const result = await client[key](...payload)
          const message = {action: 'response', name, key, id, payload: result}
          event.source.postMessage(message, event.origin as any)
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message }
      event.source.postMessage(message, event.origin as any)
    }
  }

  window.addEventListener('message', getMessage, false)
}

/**
 * Create a plugin client that listen on PostMessage
 */
export function createIframeClient<T extends ModuleProfile>(
  profiles: T[],
  options?: PluginOptions
): ApiMap<T> & PluginClient {
  const client = new PluginClient(options)
  // Add APIS
  const apis = getApiMap(client, profiles)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectIframe(client)
  listenOnThemeChanged(client, options)
  return client
}
