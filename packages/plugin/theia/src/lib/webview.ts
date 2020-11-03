import {
  applyApi,
  Client, ClientConnector,
  connectClient,



  isHandshake, PluginClient,

  PluginOptions
} from '@remixproject/plugin';
import type { Api, ApiMap, Message } from '@remixproject/plugin-utils';
import * as theia from '@theia/plugin';



/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  source: { showInformationMessage: (message: string , ...items:string[]) => void }
  origin: string
  isTheia: boolean

  constructor(private options: Partial<PluginOptions<any>> = {}) {
    this.isTheia = !!theia
    if(!this.isTheia){
      throw new Error("Must run in Theia")
    }
    this.source = theia.window;
  }


  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.isTheia) {
      this.source.showInformationMessage(message.toString())
    } else if (this.origin || isHandshake(message)) {
      const origin = this.origin || '*'
      this.source.showInformationMessage(message.toString(), origin)
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    // window.addEventListener('message', async (event: MessageEvent) => {
    //   if (!event.source) throw new Error('No source')
    //   if (!event.data) throw new Error('No data')
    //   // Support for iframe
    //   if (!this.isTheia) {
    //     if (isHandshake(event.data)) {
    //       this.origin = event.origin
    //     }
    //   }
    //   cb(event.data)

    // }, false)
  }
}

/**
 * Connect a Webview plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createClient = <
  P extends Api,
  App extends ApiMap
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  const options = client.options
  const connector = new WebviewConnector(options)
  connectClient(connector, c)
  applyApi(c)
  return client as any
}
