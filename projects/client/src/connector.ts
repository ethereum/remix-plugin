import { Message } from '../../utils/src/types/message'
import { listenEvent, callEvent } from '../../utils/src/event-name'
import { Api, ApiMap, PluginApi } from '../../utils/src/types/api'
import { getMethodPath } from '../../utils/src/method-path'
import { RemixApi } from '../../utils/src/api/remix-profile'
import { PluginClient } from './client'
import { createApi } from './api'

export interface ClientConnector {
  /** Send a message to the engine */
  send(message: Partial<Message>): void
  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void): void
}

type CreateConnector = (client: PluginClient) => ClientConnector

/** Check if a message is an handshake */
export function isHandshake(message: Partial<Message>) {
  return message.key === 'handshake' && (message.action === 'request' || message.action === 'call')
}

/**
 * Connect a plugin to the engine for a specific connector
 * @param connector The connector for this plugin
 * @param client The client instance of the plugin
 * @example With a client
 * ```typescript
 * const client = new PluginClient()
 * connectClient(new IframeConnector(client), client);
 * ```
 */
export function connectClient(connector: ClientConnector, client: PluginClient = new PluginClient()) {
  let isLoaded = false

  connector.on(async ({ action, key, name, payload, id, requestInfo, error }) => {
    try {

      // If handshake set isLoaded
      if (!isLoaded && isHandshake({ action, key })) {
        isLoaded = true
        client.events.on('send', (msg: Message) => connector.send(msg))
        client.events.emit('loaded')
        client.name = payload[0]
        // Send back the list of methods exposed by the plugin
        const message = {action: 'response', name, key, id, payload: client.methods} as const
        connector.send(message)
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
          const message = {action: 'response', name, key, id, payload: result} as const
          connector.send(message)
          break
        }
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.message } as const
      connector.send(message)
    }
  })

  // Request handshake if not loaded
  if (!isLoaded) {
    connector.send({ action: 'request', key: 'handshake', id: -1 })
  }

  return client
}

export type Client<P extends Api, A extends ApiMap> = PluginApi<A> & PluginClient<P, A>

/**
 * Add shortcut to the api requested by the client on it.
 * @description
 * Once applied, the client can do `client.solidity.compile(x)` instead of `client.call('solidity', 'compile', x)`
 * @param client The client on which we apply the api
 */
export function applyApi(client: PluginClient) {

  const profiles = client.options.customApi || {}

  for (const name in profiles) {
    if (client[name]) {
      const error = `Your plugin client should have a method/attribut named "${name}" as it is the name of another plugin. `
      const solution = `To prevent this set the option "customApi" to "null" in the client's options. `
      const example = `For exemple: "const client = createIframeClient(new PluginClient<any, any>({ customApi: null }))".`
      throw new Error(error + solution + example)
    }
    client[name] = createApi(client, profiles[name])
  }
}


/**
 * Create & connect a client with a connector.
 * @param connector A communication layer connector
 * @param client The plugin client
 */
export const createClient = <
  P extends Api,
  App extends ApiMap = RemixApi
>(
  connector: ClientConnector,
  client: PluginClient<P, App> = new PluginClient()
): Client<P, App> => {
  const c = client as any
  connectClient(connector, c)
  applyApi(c)
  return c
}
