import { Message, PluginApi, ApiMap, ProfileMap, Api, listenEvent, callEvent, RemixApi, getMethodPath } from '../utils'
import { getApiMap } from '@remixproject/plugin/api'
import { PluginClient, PluginOptions } from '@remixproject/plugin/client'

export function connectChildProcess(client: PluginClient) {
  let isLoaded = false
  async function getMessage(event: Partial<Message>) {
    // Get the data
    const { action, key, name, payload, id, requestInfo, error } = event
    try {

      // If handshake set isLoaded
      if (action === 'request' && key === 'handshake') {
        isLoaded = true
        client.events.on('send', (msg: Message) => process.send(JSON.stringify(msg)))
        client.events.emit('loaded')
        client.name = payload[0]
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods}
        process.send(JSON.stringify(message))
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
          delete client.currentRequest
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
          const message = {action: 'response', name, key, id, payload: result}
          process.send(JSON.stringify(message))
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message }
      process.send(JSON.stringify(message))
    }
  }
  process.on('message', getMessage)

  // Request handshake if not loaded
  if (!isLoaded) {
    const handshake = { action: 'request', key: 'handshake', id: -1 }
    process.send(JSON.stringify(handshake))
  }
}

/**
 * Connect the client to the process
 * @param client A plugin client
 */
export function buildChildProcessClient<T extends Api, App extends ApiMap = RemixApi>(
  client: PluginClient<T, App>
): PluginApi<GetApi<typeof client.options.customApi>> & PluginClient<T, App> {
  // Add APIS
  const apis = getApiMap<ProfileMap<App>, App>(client, client.options.customApi)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectChildProcess(client as any)
  return client as any
}


/**
 * Create a plugin client that listen on process messages
 * @param options The options for the client
 */
export function createChildProcessClient<T extends Api, App extends ApiMap = RemixApi>(
  options: Partial<PluginOptions<App>> = { customTheme: true }
): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App> {
  const client = new PluginClient<T, App>(options)
  return buildChildProcessClient(client)
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never
