import { PluginClient, PluginOptions } from '@remixproject/plugin/client'
import { getApiMap } from '@remixproject/plugin/api'
import { Message, listenEvent, callEvent, getMethodPath, Api, ApiMap, RemixApi, PluginApi, ProfileMap } from '@utils'
import { listenOnThemeChanged } from './theme'
import { checkOrigin } from './origin'

/**
 * Start listening on the IDE though PostMessage
 * @param client A client to put the messages into
 */
export function connectIframe(client: PluginClient) {
  let isLoaded = false

  async function getMessage(event: MessageEvent) {
    if (!event.source) throw new Error('No source')

    // Check that the origin is the right one
    const devMode = client.options.devMode
    const isGoodOrigin = await checkOrigin(event.origin, devMode)
    if (!isGoodOrigin) return

    // Get the data
    if (!event.data) throw new Error('No data')
    const { action, key, name, payload, id, requestInfo, error } = event.data as Message
    try {

      // If handshake set isLoaded
      if (action === 'request' && key === 'handshake') {
        isLoaded = true
        client.events.on('send', (msg: Message) => {
          (event.source as Window).postMessage(msg, event.origin as any)
        })
        client.events.emit('loaded')
        client.name = payload[0]
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods};
        (event.source as Window).postMessage(message, event.origin)
        return
      }

      // Check if is isLoaded
      if (!isLoaded) throw new Error('Handshake before communicating')

      switch (action) {
        case 'emit':
        case 'notification': {
          client.events.emit(listenEvent(name, key), ...payload)
          break
        }
        case 'response': {
          client.events.emit(callEvent(name, key, id), payload, error)
          break
        }
        case 'call':
        case 'request': {
          const path = requestInfo && requestInfo.path
          const method = getMethodPath(key, path)
          if (!client[method]) {
            throw new Error(`Method ${method} doesn't exist on plugin ${name}`)
          }
          client.currentRequest = requestInfo
          const result = await client[method](...payload)
          const message = {action: 'response', name, key, id, payload: result};
          (event.source as Window).postMessage(message, event.origin)
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message };
      (event.source as Window).postMessage(message, event.origin)
    }
  }

  window.addEventListener('message', getMessage, false)

  // Request handshake if not loaded
  if (!isLoaded) {
    const handshake = { action: 'request', key: 'handshake', id: -1 }
    window.parent.postMessage(handshake, '*')
  }
}

/**
 * Create a plugin client that listen on PostMessage
 * @param options The options for the client
 */
export function createIframeClient<T extends Api, App extends ApiMap = RemixApi>(
  options: Partial<PluginOptions<App>> = {}
): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App> {
  const client = new PluginClient<T, App>(options)
  return buildIframeClient(client)
}

/**
 * Connect the client to the iframe
 * @param client A plugin client
 */
export function buildIframeClient<T extends Api, App extends ApiMap = RemixApi>(
  client: PluginClient<T, App>
): PluginApi<GetApi<typeof client.options.customApi>> & PluginClient<T, App> {
  // Add APIS
  const apis = getApiMap<ProfileMap<App>, App>(client, client.options.customApi)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectIframe(client as any)
  listenOnThemeChanged(client as any, client.options)
  return client as any
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never