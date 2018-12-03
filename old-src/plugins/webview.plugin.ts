import { RemixPlugin } from "./types"
import { ModuleManager } from "../module-manager"

export interface WebviewService {
  create(url: string, hash: string): { source: Window, origin: string }
}

/**
 * The API to manage Iframes (called webview here)
 */
export class WebviewApi extends RemixPlugin {

  protected manager: ModuleManager
  private webViews: { [origin: string]: Webview } = {}

  private messageListener = ({ data, origin }) => {
    if (typeof data !== 'string') return
    if (!this.webViews[origin]) return
    this.webViews[origin].receive(JSON.parse(data))
  }

  constructor(private service: WebviewService) {
    super('webview')
  }


  public async activate(manager: ModuleManager) {
    this.manager = manager
    window.addEventListener('message', this.messageListener, false)

    this.addMethod('create', async ({url, hash}) => {
      // TODO : Check that this url is ok
      const { source, origin } = this.service.create(url, hash)
      this.webViews[origin] = new Webview(source, origin)
      return this.webViews[origin]
    })

    this.manager.request('blue-bar', 'addBlueStuff', { name: 'webview' })
  }

  public deactivate() {
    // TODO : Remove methods
    window.removeEventListener('message', this.messageListener, false)
  }

}

/**
 * The object returned by the WebviewApi when "create" is called
 */
export class Webview {

  private _onMessage: (message) => any
  public id = 0
  public pendingRequest: ((result: any) => any)[]  = []

  constructor(private source: Window, private origin: string) {}

  public receive(message) {
    // Response
    if (!!this.pendingRequest[message.id]) {
      this.pendingRequest[message.id](message.value)
      delete this.pendingRequest[message.id]
    // Notification
    } else {
      this._onMessage(message.value)
    }
  }

  public postMessage(message) {
    this.id++
    const msg = { ...message, id: this.id }
    this.source.postMessage(JSON.stringify(msg), this.origin)
    // TODO : Handle error
    return new Promise((res, rej) => {
      this.pendingRequest[this.id] = (result) => {
        res(result)
      }
    })
  }

  public onMessage(cb: (message) => any) {
    this._onMessage = cb
  }
}