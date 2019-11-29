import { Message, PluginApi, ApiMap, ProfileMap, Api, listenEvent, callEvent, RemixApi, getMethodPath } from '../utils'
import { getApiMap } from '@remixproject/plugin/api'
import { PluginClient, PluginOptions } from '@remixproject/plugin/client'

// import WebSocket from 'ws'

export interface WS {
  send(data: string): void
  on(type: 'message', cb: (event: WSData) => any): this
}

export interface WSData {
  toString(): string
}

export function connectWS(socket: WS, client: PluginClient) {
  let isLoaded = false
  async function getMessage(event: WSData) {
    // Get the data
    const { action, key, name, payload, id, requestInfo, error } = JSON.parse(event.toString()) as Message
    try {

      // If handshake set isLoaded
      if (action === 'request' && key === 'handshake') {
        isLoaded = true
        client.events.on('send', (msg: Message) => socket.send(JSON.stringify(msg)))
        client.events.emit('loaded')
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods}
        socket.send(JSON.stringify(message))
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
          const path = requestInfo && requestInfo.path
          const method = getMethodPath(key, path)
          if (!client[method]) {
            throw new Error(`Method ${method} doesn't exist on plugin ${name}`)
          }
          client.currentRequest = requestInfo
          const result = await client[method](...payload)
          const message = {action: 'response', name, key, id, payload: result}
          socket.send(JSON.stringify(message))
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message }
      socket.send(JSON.stringify(message))
    }
  }
  socket.on('message', getMessage)

  // Request handshake if not loaded
  if (!isLoaded) {
    const handshake = { action: 'request', key: 'handshake', id: -1 }
    socket.send(JSON.stringify(handshake))
  }
}

/**
 * Connect the client to the socket
 * @param client A plugin client
 */
export function buildWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(
  socket: WS,
  client: PluginClient<T, App>
): PluginApi<GetApi<typeof client.options.customApi>> & PluginClient<T, App> {
  // Add APIS
  const apis = getApiMap<ProfileMap<App>, App>(client, client.options.customApi)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectWS(socket, client)
  return client as any
}


/**
 * Create a plugin client that listen on socket messages
 * @param options The options for the client
 */
export function createWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(
  socket: WS,
  options: Partial<PluginOptions<App>> = { customTheme: true }
): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App> {
  const client = new PluginClient<T, App>(options)
  return buildWebsocketClient(socket, client)
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never
