import { ModuleManager } from './module-manager'
import { Message } from './remix-module'
import { IframeProfile } from './iframe.module'

export class IframeService {

  public origins: {
    [type: string]: string
  }

  public responses: {
    [type: string]: {
      [id: number]: (result: any) => any
    }
  } = {}


  constructor(private manager: ModuleManager) {
    /** Listen for all messages coming from iframes */
    window.addEventListener('message', async (event) => {
      const message = JSON.parse(event.data) as Message
      if (message.action === 'notification') {
        this.handleNotification(message)
      } else if (message.action === 'request') {
        this.handleRequest(event, message)
      } else if (message.action === 'response') {
        this.handleResponse(event, message)
      } else {
        throw new Error('Message should be a notification, request or response')
      }
    })
  }

  /** Handle a notification send from an iframe */
  private handleNotification(message) {
    this.manager.broadcast(message)
  }

  /** Handle a request send from an iframe */
  private async handleRequest(event: MessageEvent, msg: Message) {
    // TODO : do some checks
    const source = event.source as Window
    const action = 'response'
    try {
      const res = await this.manager.call(msg)
      const response = JSON.stringify({ ...res, action  })
      source.postMessage(response, event.origin)
    } catch (error) {
      const response = JSON.stringify({ ...msg, action, error})
      source.postMessage(response, event.origin)
    }
  }

  /** Handle a response send from an iframe */
  private handleResponse(event: MessageEvent, {type, id, value}: Message) {
    if (event.origin !== this.origins[type]) {
      throw new Error('Not the right origin')
    }
    this.responses[type][id](value)
    delete this.responses[type][id]
  }

  /** Create an iframe element */
  public create({ type, url }: IframeProfile) {
    const iframe = new HTMLIFrameElement()
    iframe.src = url
    // TODO: Append to the DOM
    if (!iframe.contentWindow) throw new Error('No window attached to Iframe')
    // TODO: handshake and get origin back
    const origin = '' // TODO : remove
    this.origins[type] = origin
    return { iframe, origin }
  }

  /** Add a listener on event */
  public onEvent(origin: string, type: string, key: string, cb: (value: any) => any) {
    this.manager.events[origin][type][key] = cb
  }

  /** Add a listent on response */
  public onResponse(type: string, id: number, cb: (value: any) => void) {
    this.responses[type][id] = cb
  }
}