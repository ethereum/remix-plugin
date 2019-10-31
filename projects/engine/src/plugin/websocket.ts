import { Plugin } from './abstract'
import { Message, ExternalProfile } from '../../../utils'

interface PluginPendingRequest {
  [id: number]: (result: any, error: Error) => void
}

type MessageListener = ['message', (e: MessageEvent) => void, false]

export class WebsocketPlugin extends Plugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getMessage(e), false]
  private id = 0
  private pendingRequest: PluginPendingRequest = {}
  private socket: WebSocket
  private isOpen: boolean

  constructor(public profile: ExternalProfile) {
    super(profile)
    this.socket = new WebSocket(profile.url)
  }

  activate() {
    this.socket.addEventListener('open', async () => {
      this.isOpen = true
      this.socket.addEventListener(...this.listener)
      const methods: string[] = await this.callPluginMethod('handshake')
      if (methods) {
        this.profile.methods = methods
      }
    })
  }

  deactivate() {
    this.socket.removeEventListener(...this.listener)
    super.deactivate()
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
    if (event.origin !== this.socket.url) return // Filter only messages that comes from this origin
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
    if (!this.isOpen) {
      throw new Error('Websocket connection is not open yet')
    }
    this.socket.send(JSON.stringify(message))
  }

}