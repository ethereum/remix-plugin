import { ViewPlugin } from './view'
import { Message, IframeProfile } from '../../../utils'


interface PluginPendingRequest {
  [id: number]: (result: any, error: Error) => void
}

type MessageListener = ['message', (e: MessageEvent) => void, false]

export class IframePlugin extends ViewPlugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getMessage(e), false]
  private id = 0
  private iframe = document.createElement('iframe')
  private origin: string
  private source: Window
  private pendingRequest: PluginPendingRequest = {}

  constructor(public profile: IframeProfile) {
    super(profile)
  }

  deactivate() {
    this.iframe.remove()
    window.removeEventListener(...this.listener)
    super.deactivate()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[] = []): Promise<any> {
    const action = 'request'
    const id = this.id++
    const requestInfo = this.currentRequest
    const name = this.name
    this.postMessage({ id, action, key, payload, requestInfo, name })
    return new Promise((res, rej) => {
      this.pendingRequest[id] = (result: any, error: Error) => error ? rej (error) : res(result)
    })
  }

  /** Get message from the iframe */
  private async getMessage(event: MessageEvent) {
    if (event.origin !== this.origin) return // Filter only messages that comes from this origin
    const message: Message = event.data
    switch (message.action) {
      // Start listening on an event
      case 'listen': {
        const { name, key } = message
        const action = 'notification'
        this.on(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      // Emit an event
      case 'notification': {
        if (!message.payload) break
        this.emit(message.key, ...message.payload)
        break
      }
      // Call a method
      case 'request': {
        const action = 'response'
        try {
          const payload = await this.call(message.name, message.key, message.payload)
          const error = undefined
          this.postMessage({ ...message, action, payload, error })
        } catch (err) {
          const payload = undefined
          const error = err.message
          this.postMessage({ ...message, action, payload, error })
        }
        break
      }
      // Return result from exposed method
      case 'response': {
        const { id, payload, error } = message
        this.pendingRequest[id](payload, error)
        delete this.pendingRequest[id]
        break
      }
      default: {
        throw new Error('Message should be a notification, request or response')
      }
    }
  }

  /**
   * Post a message to the iframe of this plugin
   * @param message The message to post
   */
  private postMessage(message: Partial<Message>) {
    if (!this.source) {
      throw new Error('No window attached to Iframe yet')
    }
    this.source.postMessage(message, this.origin)
  }

  /**
   * Create and return the iframe
   */
  render() {
    if (this.iframe.contentWindow) {
      throw new Error(`${this.name} plugin is already rendered`)
    }
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-top-navigation')
    this.iframe.setAttribute('seamless', 'true')
    this.iframe.src = this.profile.url
    // Wait for the iframe to load and handshake
    this.iframe.onload = async () => {
      if (!this.iframe.contentWindow) {
        throw new Error(`${this.name} plugin is cannot find url ${this.profile.url}`)
      }
      window.addEventListener(...this.listener)
      this.origin = new URL(this.iframe.src).origin
      this.source = this.iframe.contentWindow
      const methods: string[] = await this.callPluginMethod('handshake')
      if (methods) {
        this.profile.methods = methods
      }
    }
    return this.iframe
  }
}