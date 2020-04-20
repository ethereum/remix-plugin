import { ClientConnector, connectClient, applyApi, Client } from '@remixproject/plugin/connector'
import { PluginClient } from '@remixproject/plugin/client'
import { Message } from '../utils/src/types/message'
import { RemixApi } from '../utils/src/api/remix-profile'
import { Api, ApiMap } from '../utils/src/types/api'


export const childProcessConnector: ClientConnector = {

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    process.send(message)
  },

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    process.on('message', (event) => cb(event))
  }
}

/**
 * Connect an Child Process client to a web engine
 * @param client An optional child process plugin client to connect to the engine.
 *
 * ---------
 * @example
 * ```typescript
 * const client = createChildProcessClient()
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
 * const client = createChildProcessClient(new MyPlugin())
 * ```
 */
export const createChildProcessClient = <
  P extends Api,
  App extends ApiMap = RemixApi
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(childProcessConnector, c)
  applyApi(c)
  return c
}
