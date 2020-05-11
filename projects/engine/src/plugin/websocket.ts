import { Message, ExternalProfile, Profile } from '../../../utils'
import { ExternalPlugin, transformUrl, ExternalPluginOptions } from './external'

interface PluginPendingRequest {
  [id: number]: (result: any, error: Error | string) => void
}

interface WebsocketOptions extends ExternalPluginOptions {
  /** Time (in ms) to wait before reconnection after connection closed */
  reconnectDelay: number
}

type MessageListener = ['message', (e: MessageEvent) => void, false]
type ReconnectListener = ['close', () => void, false]
export type WebsocketProfile = Profile & ExternalProfile

export class WebsocketPlugin extends ExternalPlugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getEvent(e), false]
  private readonly reconnectOnclose: ReconnectListener = ['close', () => this.reconnect(), false]
  protected socket: WebSocket
  protected options: WebsocketOptions = {
    transformUrl,
    reconnectDelay: 1000
  }

  constructor(public profile: WebsocketProfile, options: Partial<WebsocketOptions> = {}) {
    super(profile)
    this.setOptions(options)
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

  setOptions(options: Partial<WebsocketOptions> = {}) {
    super.setOptions(options)
  }

  /** Try to reconnect to net websocket if closes */
  protected reconnect() {
    this.loaded = false
    setTimeout(() => this.connect(), this.options.reconnectDelay) // Try to reconnect if connection failed
  }

  /** Connect to the websocket */
  protected connect() {
    const url = this.options.transformUrl ? this.options.transformUrl(this.profile) : this.profile.url
    this.socket = new WebSocket(url)
    this.socket.addEventListener('open', async () => {
      this.socket.addEventListener(...this.listener)
      this.handshake()
    })
  }

  /** Get message from the iframe */
  private async getEvent(event: MessageEvent) {
    const message: Message = JSON.parse(event.data)
    this.getMessage(message)
  }

  /**
   * Post a message to the iframe of this plugin
   * @param message The message to post
   */
  protected postMessage(message: Partial<Message>) {
    if (this.socket.readyState !== this.socket.OPEN) {
      throw new Error('Websocket connection is not open yet')
    }
    this.socket.send(JSON.stringify(message))
  }

}