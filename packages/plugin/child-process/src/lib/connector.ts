import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'
import { fork, ChildProcess } from 'child_process'
export class ChildProcessConnector implements ClientConnector {
  process: ChildProcess
  constructor() {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    this.process.send(JSON.stringify(message))
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    this.process.on('message', (event) => cb(JSON.parse(JSON.stringify(event))))
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
