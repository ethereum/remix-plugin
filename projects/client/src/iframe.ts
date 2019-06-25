import { PluginDevMode, PluginClient, PluginOptions } from './client'
import { Message, PluginApi, ApiMap, ProfileMap, Api, listenEvent, callEvent, RemixApi } from '../../utils'
import { getApiMap, listenOnThemeChanged } from './api'

/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param devMode Devmode options
 */
export async function checkOrigin(origin: string, devMode: Partial<PluginDevMode> = {}) {
  const localhost = devMode.port ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  const origins = devMode.origins
    ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
    : []
  const res = await fetch('https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json')
  const defaultOrigins = await res.json()
  return [
    ...defaultOrigins,
    ...localhost,
    ...origins
  ].includes(origin)
}

/**
 * Start listening on the IDE though PostMessage
 * @param client A client to put the messages into
 */
export function connectIframe(client: PluginClient<any, any>) {
  let loaded = false

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

      // If handshake set loaded
      if (action === 'request' && key === 'handshake') {
        loaded = true
        client.events.on('send', (message: Message) => {
          (event.source as Window).postMessage(message, event.origin as any)
        })
        client.events.emit('loaded')
        return
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
}

/**
 * Create a plugin client that listen on PostMessage
 * @param options The options for the client
 */
export function createIframeClient<T extends Api, App extends ApiMap = RemixApi>(
  options: Partial<PluginOptions<App>> = {}
): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App> {
  const client = new PluginClient<T, App>(options)
  // Add APIS
  const apis = getApiMap<ProfileMap<App>, App>(client, client.options.customApi)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectIframe(client)
  listenOnThemeChanged(client, client.options)
  return client as any
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never
