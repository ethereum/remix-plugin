import { AppManager } from './app-manager'
import { RemixModule, ModuleProfile, Message, Profile } from './remix-module'

export interface IframeProfile extends ModuleProfile {
  url: string
  load: { type: string, key: string }
}

export interface ExternalProfile<I extends IframeProfile> extends Profile<I> {
  url: I['url']
  load: I['load']
}

export class Plugin<T extends IframeProfile> extends RemixModule<T> {
  private id = 0
  private iframe: HTMLIFrameElement
  private source: Window
  private origin: string
  private pendingRequest: {
    [type: string]: {
      [id: number]: (value: any) => void
    }
  } = {}

  public activate: () => void
  public deactivate: () => void

  constructor(
    json: ExternalProfile<T>,
    private manager: AppManager
  ) {
    super(json)

    const getMessage = (event) => this.getMessage(event)

    // Listen on message from the iframe and to the event
    this.activate = async () => {
      await this.create(json)
      window.addEventListener('message', getMessage, false)
      json.notifications.forEach(({ type, key }) => {
        this.manager.addEvent(json.type, type, key, (value: any) => {
          this.postMessage({ type, key, value })
        })
      })
    }

    // Remove events that come from iframe
    this.deactivate = () => {
      this.iframe.remove()
      window.removeEventListener('message', getMessage, false)
      json.notifications.forEach(({ type, key }) => {
        this.manager.removeEvent(json.type, type, key)
      })
    }
  }

  /** Post a message to the iframe of this plugin */
  private postMessage(message: Partial<Message>) {
    const msg = JSON.stringify(message)
    this.source.postMessage(msg, this.origin)
  }

  /** Get message from the iframe */
  private async getMessage(event: MessageEvent) {
    const message = JSON.parse(event.data) as Message

    if (event.origin !== this.origin) return	// Filter only messages that comes from this origin
    switch (message.action) {
      case 'notification' : {
        this.manager.broadcast(message)
        break
      }
      case 'request' : {
        const action = 'response'
        try {
          const res = await this.manager.call(message)
          this.postMessage({ ...res, action  })
        } catch (error) {
          this.postMessage({ ...message, action, error})
        }
        break
      }
      case 'response': {
        const { type, id, value } = message
        this.pendingRequest[type][id](value)
        delete this.pendingRequest[type][id]
        break
      }
      default: {
        throw new Error('Message should be a notification, request or response')
      }
    }
  }

  /** Create an iframe element */
  private async create({url, load}: ExternalProfile<T>) {
    // Create
    try {
      const { type, key } = load
      const message = { action: 'request', type, key, value: {} } as Message
      const parent = await this.manager.call(message) as HTMLElement
      this.iframe = document.createElement('iframe')
      this.iframe.src = url
      parent.appendChild(this.iframe)
      if (!this.iframe.contentWindow) throw new Error('No window attached to Iframe')
      this.source = this.iframe.contentWindow
      this.origin = this.iframe.contentWindow.origin
    } catch (err) {
      console.log(err)
    }

    // Handshake
    this.postMessage({ action: 'request', type: this.type, key : 'handshake' })
  }


  /** Call a method of this plugin */
  public call(message: Message) {
    this.checkMethod(message)
    this.id ++
    const msg = JSON.stringify({ id: this.id, ...message })
    this.source.postMessage(msg, this.origin)
    return new Promise((res, rej) => {
      this.pendingRequest[this.type][this.id] = (value: any) => res(value)
    })
  }

}
