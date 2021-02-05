import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'
export class ChildProcessConnector implements ClientConnector {
  constructor() {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    process.send(message)
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    process.on('message', (event) => cb(event))
  }
}

export const createClient = <
  P extends Api,
  App extends ApiMap = Readonly<IRemixApi>
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(new ChildProcessConnector(), c)
  applyApi(c)
  return c
}
