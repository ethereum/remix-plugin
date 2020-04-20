import { PluginConnector, Profile, ExternalProfile, Message } from '@remixproject/engine'

export interface WebsocketOptions {
  /** Time (in ms) to wait before reconnection after connection closed */
  reconnectDelay: number
}

export class WebsocktPlugin extends PluginConnector {
  // Listener is needed to remove the listener
  private readonly listeners = {
    message: ['message', (e: MessageEvent) => this.getEvent(e), false] as const,
    close: ['close', (e: CloseEvent) => this.onclose(e), false] as const,
  }
  private url: string
  protected socket: WebSocket
  protected options: WebsocketOptions = {
    reconnectDelay: 1000
  }

  constructor(
    profile: Profile & ExternalProfile,
    options: Partial<WebsocketOptions> = {}
  ) {
    super(profile)
    this.options = { ...this.options, ...options }
  }

  private async getEvent(event: MessageEvent) {
    const message: Message = JSON.parse(event.data)
    this.getMessage(message)
  }

  /** Open a connection with the server (also used for reconnection) */
  private open() {
    this.socket = new WebSocket(this.url)
    this.socket.addEventListener('open', async () => {
      this.socket.addEventListener(...this.listeners.message)
      this.handshake()
    })
  }

  /** Try to reconnect to net websocket if closes */
  private onclose(e: CloseEvent) {
    this.loaded = false
    // Abnormal closing Try to reconnect
    if (e.code !== 1000) {
      setTimeout(() => this.open(), this.options.reconnectDelay)
    }
  }

  protected send(message: Partial<Message>) {
    if (this.socket.readyState !== this.socket.OPEN) {
      throw new Error('Websocket connection is not open yet')
    }
    this.socket.send(JSON.stringify(message))
  }

  protected connect(url: string): void {
    this.url = url
    this.open()
    this.socket.addEventListener(...this.listeners.close)
  }

  protected disconnect(): void {
    this.socket.removeEventListener(...this.listeners.close)
    this.socket.removeEventListener(...this.listeners.message)
    this.socket.close()
  }
}
