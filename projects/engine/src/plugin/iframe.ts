import { ViewPlugin } from './view'
import { Message, ExternalProfile, Profile, LocationProfile } from '../../../utils'
import { transformUrl } from './util'

type MessageListener = ['message', (e: MessageEvent) => void, false]

export type IframeProfile = Profile & LocationProfile & ExternalProfile

export class IframePlugin extends ViewPlugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getMessage(e), false]
  private id = 0
  private iframe = document.createElement('iframe')
  private origin: string
  private source: Window
  private pendingRequest: Record<number, (result: any, error: Error | string) => void> = {}

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
    const promise = new Promise((res, rej) => {
      this.pendingRequest[id] = (result: any[], error: Error | string) => error ? rej (error) : res(result)
    })
    this.postMessage({ id, action, key, payload, requestInfo, name })
    return promise
  }

  /** Get message from the iframe */
  private async getMessage(event: MessageEvent) {
    if (event.origin !== this.origin) return // Filter only messages that comes from this origin
    const message: Message = event.data

    // Check for handshake request from the client
    if (message.action === 'request' && message.key === 'handshake') {
      const methods: string[] = await this.callPluginMethod('handshake')
      if (methods) {
        this.profile.methods = methods
      }
      return
    }

    switch (message.action) {
      // Start listening on an event
      case 'on':
      case 'listen': {
        const { name, key } = message
        const action = 'notification'
        this.on(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      case 'off': {
        const { name, key } = message
        this.off(name, key)
        break
      }
      case 'once': {
        const { name, key } = message
        const action = 'notification'
        this.once(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      // Emit an event
      case 'emit':
      case 'notification': {
        if (!message.payload) break
        this.emit(message.key, ...message.payload)
        break
      }
      // Call a method
      case 'call':
      case 'request': {
        const action = 'response'
        try {
          const payload = await this.call(message.name, message.key, ...message.payload)
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
    this.iframe.setAttribute('sandbox', 'allow-popups allow-scripts allow-same-origin allow-forms allow-top-navigation')
    this.iframe.setAttribute('seamless', 'true')
    this.iframe.src = transformUrl(this.profile.url)
    // Wait for the iframe to load and handshake
    this.iframe.onload = async () => {
      if (!this.iframe.contentWindow) {
        throw new Error(`${this.name} plugin is cannot find url ${this.profile.url}`)
      }
      this.origin = new URL(this.iframe.src).origin
      this.source = this.iframe.contentWindow
      window.addEventListener(...this.listener)
      const methods: string[] = await this.callPluginMethod('handshake')
      if (methods) {
        this.profile.methods = methods
        this.call('manager', 'updateProfile', this.profile)
      }
    }
    return this.iframe
  }
}