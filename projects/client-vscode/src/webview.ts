import { ClientConnector, connectClient, applyApi, Client } from '@remixproject/plugin/connector'
import { PluginClient } from '@remixproject/plugin/client'
import { Message } from '../../utils/src/types/message'
import { Api, ApiMap } from '../../utils/src/types/api'


declare const acquireVsCodeApi: any

/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  postMessage: (message: any) => void
  constructor() {
    // Get the acquireVsCodeApi injected by vscode
    if (acquireVsCodeApi) {
      this.postMessage = acquireVsCodeApi().postMessage
    }
  }

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    this.postMessage(message)
  }

  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void) {
    if (!window) {
      return
    }
    window.addEventListener('message', (event: MessageEvent) => {
      if (!event.source) throw new Error('No source')
      if (!event.data) throw new Error('No data')
      cb(event.data)
    }, false)
  }
}

/**
 * Connect a Webview plugin client to a vscode engine
 * @param client An optional Webview plugin client to connect to the engine.
 */
export const createWebviewClient = <
  P extends Api,
  App extends ApiMap
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  connectClient(new WebviewConnector(), client)
  applyApi(client)
  return client as any
}

