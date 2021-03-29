import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils'
import { PluginConnector, PluginConnectorOptions } from '@remixproject/engine'
import { privateToAddress, ecsign, keccakFromString, toRpcSig } from 'ethereumjs-util'

export interface WebsocketOptions extends PluginConnectorOptions {
  /** Time (in ms) to wait before reconnection after connection closed */
  reconnectDelay: number
}

export class WebsocketPlugin extends PluginConnector {
  private account: Buffer
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


  /** Try to reconnect to net websocket if closes */
  private onclose(e: CloseEvent) {
    this.loaded = false
    // Abnormal closing Try to reconnect
    if (e.code !== 1000) {
      setTimeout(() => this.open(), this.options.reconnectDelay)
    }
  }

  /** Open a connection with the server (also used for reconnection) */
  protected open() {
    this.socket = new WebSocket(this.url)
    this.socket.addEventListener('open', async () => {
      this.socket.addEventListener(...this.listeners.message)
      this.account = Buffer.from('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', 'hex')
      const address = privateToAddress(this.account)
      this.handshake([address.toString('hex')])
    })
  }

  protected send(message: Partial<Message>) {
    if (this.socket.readyState !== this.socket.OPEN) {
      throw new Error('Websocket connection is not open yet')
    }
    const verifier = Date.now().toString()
    const sign = ecsign(keccakFromString(verifier), this.account)
    message.verifier = verifier
    message.signature = toRpcSig(sign.v, sign.r, sign.s)
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
