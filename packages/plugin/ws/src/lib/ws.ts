import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { PluginClient, ClientConnector, connectClient, applyApi, Client } from '@remixproject/plugin'
import { IRemixApi } from '@remixproject/plugin-api'
import { ecrecover, fromRpcSig, keccak256, pubToAddress, toBuffer } from 'ethereumjs-util'


export interface WS {
  send(data: string): void
  on(type: 'message', cb: (event: string) => any): this
}

/**
 * This Websocket connector works with the library `ws`
 */
export class WebsocketConnector implements ClientConnector {
  account: string
  constructor(private websocket: WS) {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    this.websocket.send(JSON.stringify(message))
  }

  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void) {   
    this.websocket.on('message', (event) => {
      const message: Message = JSON.parse(event)
      if (!this.account && message.key === 'handshake') {
        this.account = message.payload[2]
      }
      if (!message.signature) {
        const error = { action: message.action === 'request' ? 'response' : message.action, name: message.name, key: message.key, id: message.id, error: 'signature should have been set' }
        return this.send(error)
      }
      if (message.signature) {
        const sign = fromRpcSig(message.signature)
        const address = pubToAddress(ecrecover(keccak256(toBuffer(message.verifier)), sign.v, sign.r, sign.s)).toString('hex')
        if (address !== this.account) {
          const error = { action: message.action === 'request' ? 'response' : message.action, name: message.name, key: message.key, id: message.id, error: 'sender doesn\'t match' }
          return this.send(error)          
        }
      }
      cb(message) 
    })
  }
}

/**
 * Connect a Websocket plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 *
 * ---------
 * @example
 * ```typescript
 * const wss = new WebSocket.Server({ port: 8080 });
 * wss.on('connection', (ws) => {
 *  const client = createClient(ws)
 * })
 * ```
 * ---------
 * @example
 * ```typescript
 * class MyPlugin extends PluginClient {
 *  methods = ['hello']
 *  hello() {
 *   console.log('Hello World')
 *  }
 * }
 * const wss = new WebSocket.Server({ port: 8080 });
 * wss.on('connection', (ws) => {
 *  const client = createClient(ws, new MyPlugin())
 * })
 * ```
 */
export const createClient = <
  P extends Api,
  App extends ApiMap = Readonly<IRemixApi>
>(websocket: WS, client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(new WebsocketConnector(websocket), c)
  applyApi(c)
  return c
}
