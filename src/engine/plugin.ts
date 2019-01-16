import { Message, PluginProfile, Api, ApiEventEmitter } from '../types'
import { EventEmitter } from 'events'

interface PluginLocation {
  resolveLocaton(element: HTMLElement): void
}

export class Plugin<T extends Api> {
  private id = 0
  private iframe: HTMLIFrameElement
  private pluginLocation: PluginLocation
  private origin: string
  private source: Window
  // Request from outside to the plugin waiting for response from the plugin
  private pendingRequest: {
    [name: string]: {
      [id: number]: (payload: any) => void
    }
  } = {}

  public readonly name: T['name']
  public events: ApiEventEmitter<T>
  public notifs = {}
  public request: (value: { name: string; key: string; payload: any }) => any
  public activate: () => Promise<void>
  public deactivate: () => void

  constructor(profile: PluginProfile<T>, location?: PluginLocation) {
    if (location) this.pluginLocation = location

    this.name = profile.name
    this.events = new EventEmitter() as ApiEventEmitter<T>

    const notifs = profile.notifications || {}
    for (const name in notifs) {
      this.notifs[name] = {}
      const keys = notifs[name] || []
      keys.forEach(key => this.notifs[name][key] = (payload: any) => this.postMessage({ name, key, payload }))
    }

    const methods = profile.methods || []
    methods.forEach(method => {
      this[method as string] = (payload: any) => {
        this.id++
        this.postMessage({
          action: 'request',
          name: this.name,
          key: method as string,
          id: this.id,
          payload,
        })
        return new Promise((res, rej) => {
          this.pendingRequest[this.name][this.id] = (result: any) => res(result)
        })
      }
    })

    const getMessage = (e: MessageEvent) => this.getMessage(e)

    // Listen on message from the iframe and to the event
    this.activate = async () => {
      await this.create(profile)
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
        const { name, id, payload } = message
        this.pendingRequest[name][id](payload)
        delete this.pendingRequest[name][id]
        break
      }
      default: {
        throw new Error('Message should be a notification, request or response')
      }
    }
  }

  /** Create an iframe element */
  private async create({ url, location }: PluginProfile) {
    // Create
    try {
      this.iframe = document.createElement('iframe')
      this.iframe.src = url
      if (location) {
        const { name, key } = location
        const message = { action: 'request', name, key, payload: this.iframe }
        await this.request(message)
      } else if (this.pluginLocation) {
        this.pluginLocation.resolveLocaton(this.iframe)
      } else {
        document.body.appendChild(this.iframe)
      }
      const iframeWindow = this.iframe.contentWindow
      if (!iframeWindow) throw new Error('No window attached to Iframe yet')
      this.origin = iframeWindow.origin || iframeWindow.location.origin
      this.source = iframeWindow
      // handshake
      this.postMessage({ action: 'request', name: this.name, key: 'handshake' })

    } catch (err) {
      console.log(err)
    }
  }

  /** Post a message to the iframe of this plugin */
  private postMessage(message: Partial<Message>) {
    if (!this.source) { throw new Error('No window attached to Iframe yet') }
    const msg = JSON.stringify(message)
    this.source.postMessage(msg, this.origin)
  }

}
