import { Message, PluginApi, ApiMap, ProfileMap, Api, listenEvent, callEvent, RemixApi, Theme, getMethodPath } from '../utils'
import { PluginDevMode, PluginClient, PluginOptions, getApiMap } from '@remixproject/plugin'

/** Fetch the default origins for remix */
export async function getDefaultOrigins() {
  const res = await fetch('https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json')
  return res.json()
}

/** Get all the origins */
export async function getAllOrigins(devMode: Partial<PluginDevMode> = {}): Promise<string[]> {
  const localhost = devMode.port ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  const devOrigins = devMode.origins
    ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
    : []
  const defaultOrigins = await getDefaultOrigins()
  return [ ...defaultOrigins, ...localhost, ...devOrigins]
}



/** Start listening on theme changed */
export async function listenOnThemeChanged(client: PluginClient<any, any>, options?: Partial<PluginOptions<any>>) {
  if (options && options.customTheme) return
  const cssLink = document.createElement('link')
  cssLink.setAttribute('rel', 'stylesheet')
  document.head.prepend(cssLink)
  client.onload(async () => {
    client.on('theme', 'themeChanged', (_theme: Theme) => setTheme(cssLink, _theme))
    const theme = await client.call('theme', 'currentTheme')
    setTheme(cssLink, theme)
  })
  return cssLink
}


function setTheme(cssLink: HTMLLinkElement, theme: Theme) {
  cssLink.setAttribute('href', theme.url)
  document.documentElement.style.setProperty('--theme', theme.quality)
}


/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param devMode Devmode options
 */
export async function checkOrigin(origin: string, devMode: Partial<PluginDevMode> = {}) {
  const allOrigins = await getAllOrigins(devMode)
  return allOrigins.includes(origin)
}


/**
 * Start listening on the IDE though PostMessage
 * @param client A client to put the messages into
 */
export function connectIframe(client: PluginClient<any, any>) {
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
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods};
        (event.source as Window).postMessage(message, event.origin)
        return
      }

      // Check if is isLoaded
      if (!isLoaded) throw new Error('Handshake before communicating')

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
          const methodPath = getMethodPath(key, requestInfo.path)
          const result = await client[methodPath](...payload)
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
  connectIframe(client)
  listenOnThemeChanged(client, client.options)
  return client as any
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never
