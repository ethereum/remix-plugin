import { RemixPlugin, ModuleManager } from 'remix-plugin'

/**
 * A simple Plugin that creates an Iframe
 */
export class SimpleIframePlugin extends RemixPlugin {

  protected manager: ModuleManager

  constructor() {
    super('simple')
  }

  /** When activated by the PluginManager */
  async activate(manager: ModuleManager) {
    this.manager = manager
    // Init
    const webview = await this.manager.request('webview', 'create', {
      url: '',
      hash: '',
    })

    webview.onMessage(message => {
      // Do something with the message
    })

    // Export a method
    this.addMethod('simpleMethod', async (value: string) => {
      const message = { value }
      webview.postMessage(message)
    })
  }

  deactivate() {}
}