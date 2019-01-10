import { Message, PluginProfile, Api, ApiEventEmitter } from '../types'
import { EventEmitter } from 'events'

export class Plugin<T extends Api> {
  private id = 0
  private iframe: HTMLIFrameElement
  private source: Window
  private origin: string
  // Request from outside to the plugin waiting for response from the plugin
  private pendingRequest: {
    [name: string]: {
      [id: number]: (value: any) => void
    }
  } = {}

  public readonly name: T['name']
  public events: ApiEventEmitter<T>
  public notifs = {}
  public request: (value: { name: string; key: string; value: any }) => any
  public activate: () => Promise<void>
  public deactivate: () => void

  constructor(json: PluginProfile<T>) {
    this.name = json.name
    this.events = new EventEmitter() as ApiEventEmitter<T>

    const notifs = json.notifications || []
    notifs.forEach(({ name, key }) => {
      if (!this.notifs[name]) this.notifs[name] = {}
      this.notifs[name][key] = (value: any) => this.postMessage({ name, key, value })
    })

    const methods = json.methods || []
    methods.forEach(method => {
      this[method as string] = (value: any) => {
        this.id++
        this.postMessage({
          action: 'request',
          name: this.name,
          key: method as string,
          id: this.id,
          value,
        })
        return new Promise((res, rej) => {
          this.pendingRequest[this.name][this.id] = (result: any) => res(result)
        })
      }
    })

    const getMessage = (e: MessageEvent) => this.getMessage(e)

    // Listen on message from the iframe and to the event
    this.activate = async () => {
      await this.create(json)
      window.addEventListener('message', getMessage, false)
    }

    // Remove events that come from iframe
    this.deactivate = () => {
      this.iframe.remove()
      window.removeEventListener('message', getMessage, false)
    }
  }

  /** Get message from the iframe */
  private async getMessage(event: MessageEvent) {
    const message = JSON.parse(event.data) as Message

    if (event.origin !== this.origin) return // Filter only messages that comes from this origin
    switch (message.action) {
      case 'notification': {
        this.events.emit(message.key, message)
        break
      }
      case 'request': {
        const action = 'response'
        try {
          const res = await this.request(message)
          this.postMessage({ ...res, action })
        } catch (error) {
          this.postMessage({ ...message, action, error })
        }
        break
      }
      case 'response': {
        const { name, id, value } = message
        this.pendingRequest[name][id](value)
        delete this.pendingRequest[name][id]
        break
      }
      default: {
        throw new Error('Message should be a notification, request or response')
      }
    }
  }

  /** Create an iframe element */
  private async create({ url, loadIn }: PluginProfile) {
    // Create
    try {
      let parent: HTMLElement
      if (loadIn) {
        const { name, key } = loadIn
        const message = { action: 'request', name, key, value: {} } as Message
        parent = (await this.request(message)) as HTMLElement
      } else {
        parent = document.body
      }
      this.iframe = document.createElement('iframe')
      this.iframe.src = url
      parent.appendChild(this.iframe)
      if (!this.iframe.contentWindow)
        throw new Error('No window attached to Iframe')
      this.source = this.iframe.contentWindow
      this.origin = this.iframe.contentWindow.origin
    } catch (err) {
      console.log(err)
    }

    // Handshake
    this.postMessage({ action: 'request', name: this.name, key: 'handshake' })
  }

  /** Post a message to the iframe of this plugin */
  private postMessage(message: Partial<Message>) {
    const msg = JSON.stringify(message)
    this.source.postMessage(msg, this.origin)
  }
}
