import { Message, Api } from '../types'

export class RemixExtension<T extends Api> {
  private source: Window
  private origin: string
  private notifications: {
    [type: string]: {
      [key: string]: (value: any) => void
    }
  }
  private pendingRequests: {
    [id: number]: (value: any, error?: Error) => void
  }
  private id: number

  constructor() {
    this.notifications = {}
    this.pendingRequests = {}
    this.id = 0
    window.addEventListener('message', event => this.getMessage(event), false)
  }

  /** Manage a message coming from the parent origin */
  private getMessage(event: MessageEvent) {
    if (!event.source) return
    if (!this.checkOrigin(event.origin)) return
    if (!event.data) return
    const msg = JSON.parse(event.data) as Message
    if (!msg) return

    const { action, key, type, value, id, error } = msg
    try {

      if (action === 'request' && key === 'handshake') {
        this.source = event.source as Window
        this.origin = event.origin
      }

      if (!this.source) throw new Error('Handshake before communicating')

      if (action === 'notification') {
        if (this.notifications[key] && this.notifications[key][type]) {
          this.notifications[key][type](value)
        }
      } else if (action === 'response') {
        if (this.pendingRequests[id]) {
          this.pendingRequests[id](value, error)
          delete this.pendingRequests[id]
        }
      } else if (action === 'request') {
        if (!this[key]) {
          throw new Error(`Method ${key} doesn't exist on ${type}`)
        }
        this.send({action, type, key, id, value: this[key](value)})
      }
    } catch (err) {
      const message = { action, type, key, id, error: err.error };
      (<Window>event.source).postMessage(JSON.stringify(message), event.origin)
    }

  }

  /** Check if the sender has the right origin */
  private checkOrigin(origin: string) {
    return this.origin
      ? this.origin === origin
      : [
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org"
      ].includes(origin)
  }

  /** Send a message to source parent */
  private send(message: Partial<Message>) {
    this.source.postMessage(JSON.stringify(message), this.origin)
  }

  /** Listen on notification events from another plugin or module */
  protected listen(
    type: string,
    key: string,
    cb: (value: any) => void,
  ) {
    if (!this.notifications[type]) {
      this.notifications[type] = {}
    }
    this.notifications[type][key] = cb
  }

  /** Call a method from another plugin or module */
  protected call(type: string, key: string, value: any): Promise<any> {
    const action = 'request'
    const id = this.id++
    const message = JSON.stringify({ action, type, key, value, id })
    this.source.postMessage(message, '*')
    return new Promise((res, rej) => {
      this.pendingRequests[this.id] = (result: any, error?: Error) => {
        if (error) rej(error)
        if (!error) res(result)
      }
    })
  }

  /** Emit an event */
  public emit<Key extends keyof T['events'] & string>(key: Key, value: T['events'][Key]) {
    this.send({ action: 'notification', key, value })
  }
}
