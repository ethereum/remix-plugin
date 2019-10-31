import { Message, PluginApi, ApiMap, ProfileMap, Api, listenEvent, callEvent, RemixApi } from '../utils'
import { PluginClient, PluginOptions, getApiMap, listenOnThemeChanged } from '@remixproject/plugin'

import WebSocket from 'ws'

export function connectWS(socket: WebSocket, client: PluginClient<any, any>) {
  let isLoaded = false
  async function getMessage(event: WebSocket.Data) {

    // Get the data
    const { action, key, name, payload, id, requestInfo, error } = JSON.parse(event.toString()) as Message
    try {

      // If handshake set isLoaded
      if (action === 'request' && key === 'handshake') {
        isLoaded = true
        client.events.on('send', (msg: Message) => {
          socket.emit(JSON.stringify(msg))
        })
        client.events.emit('loaded')
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods}
        socket.emit(JSON.stringify(message))
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
          const result = await client[key](...payload)
          const message = {action: 'response', name, key, id, payload: result}
          socket.emit(JSON.stringify(message))
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message }
      socket.emit(JSON.stringify(message))
    }
  }
  socket.on('message', getMessage)

  // Request handshake if not loaded
  if (!isLoaded) {
    const handshake = { action: 'request', key: 'handshake', id: -1 }
    window.parent.postMessage(handshake, '*')
  }
}

/**
 * Connect the client to the socket
 * @param client A plugin client
 */
export function buildWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(
  socket: WebSocket,
  client: PluginClient<T, App>
): PluginApi<GetApi<typeof client.options.customApi>> & PluginClient<T, App> {
  // Add APIS
  const apis = getApiMap<ProfileMap<App>, App>(client, client.options.customApi)
  Object.keys(apis).forEach(name => client[name] = apis[name])
  // Listen on changes
  connectWS(socket, client)
  listenOnThemeChanged(client, client.options)
  return client as any
}


/**
 * Create a plugin client that listen on socket messages
 * @param options The options for the client
 */
export function createWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(
  socket: WebSocket,
  options: Partial<PluginOptions<App>> = {}
): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App> {
  const client = new PluginClient<T, App>(options)
  return buildWebsocketClient(socket, client)
}

type GetApi<T> = T extends ProfileMap<infer I> ? I : never
