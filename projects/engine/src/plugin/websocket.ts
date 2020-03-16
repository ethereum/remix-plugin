import { Plugin } from './abstract'
import { Message, ExternalProfile, Profile } from '../../../utils'

interface PluginPendingRequest {
  [id: number]: (result: any, error: Error | string) => void
}

interface WebsocketOptions {
  /** Time (in ms) to wait before reconnection after connection closed */
  reconnectDelay: number
}

type MessageListener = ['message', (e: MessageEvent) => void, false]
type ReconnectListener = ['close', () => void, false]
export type WebsocketProfile = Profile & ExternalProfile

export class WebsocketPlugin extends Plugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getMessage(e), false]
  private readonly reconnectOnclose: ReconnectListener = ['close', () => this.reconnect(), false]
  private id = 0
  private pendingRequest: PluginPendingRequest = {}
  protected socket: WebSocket
  protected options: WebsocketOptions = {
    reconnectDelay: 1000
  }

  constructor(public profile: WebsocketProfile, options: Partial<WebsocketOptions> = {}) {
    super(profile)
    this.options = { ...this.options, ...options }
  }

  async activate() {
    this.connect()
    this.socket.addEventListener(...this.reconnectOnclose)
    super.activate()
  }

  deactivate() {
    this.socket.removeEventListener(...this.reconnectOnclose)
    this.socket.removeEventListener(...this.listener)
    this.socket.close()
    super.deactivate()
  }

  /** Try to reconnect to net websocket if closes */
  protected reconnect() {
    setTimeout(() => this.connect(), this.options.reconnectDelay) // Try to reconnect if connection failed
  }

  /** Connect to the websocket */
  protected connect() {
    this.socket = new WebSocket(this.profile.url)
    this.socket.addEventListener('open', async () => {
      this.socket.addEventListener(...this.listener)
      const methods: string[] = await this.callPluginMethod('handshake', [this.profile.name])
      if (methods) {
        this.profile.methods = methods
        this.call('manager', 'updateProfile', this.profile)
      }
    })
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[] = []): Promise<any> {
    const action = 'request'
    const id = this.id++
    const requestInfo = this.currentRequest
    const name = this.name
    const promise = new Promise((res, rej) => {
      this.pendingRequest[id] = (result: any[], error: Error) => error ? rej (error) : res(result)
    })
    this.postMessage({ id, action, key, payload, requestInfo, name })
    return promise
  }

  /** Get message from the iframe */
  private async getMessage(event: MessageEvent) {
    const message: Message = JSON.parse(event.data)

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
        const action = 'emit'
        this.on(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      case 'once': {
        const { name, key } = message
        const action = 'emit'
        this.once(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      case 'off': {
        const { name, key } = message
        this.off(name, key)
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
          const error = err.message || `request to method ${message.key} of plugin ${message.name} throw without any message`
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
    if (this.socket.readyState !== this.socket.OPEN) {
      throw new Error('Websocket connection is not open yet')
    }
    this.socket.send(JSON.stringify(message))
  }

}