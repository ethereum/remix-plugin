import { Message, Api } from '../types'

export class RemixExtension<T extends Api = any> {
  private source: Window
  private origin: string
  private notifications: {
    [name: string]: {
      [key: string]: (...payload: any[]) => void
    }
  }
  private pendingRequests: {
    [id: number]: (payload: any, error?: Error) => void
  }
  private id: number
  private handshake: ({theme: string}) => any

  constructor() {
    this.notifications = {}
    this.pendingRequests = {}
    this.id = 0
    window.addEventListener('message', event => this.getMessage(event), false)
  }

  /** Manage a message coming from the parent origin */
  private async getMessage(event: MessageEvent) {
    if (!event.source) throw new Error('No source')
    if (!this.checkOrigin(event.origin)) return
    if (!event.data) throw new Error('No data')
    const msg: Message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    if (!msg) throw new Error('No message in data')

    const { action, key, name, payload, id, error } = msg
    try {

      if (action === 'request' && key === 'handshake') {
        this.source = event.source as Window
        this.origin = event.origin
        if (this.handshake) this.handshake(payload)
        return
      }

      if (!this.source) throw new Error('Handshake before communicating')

      if (action === 'notification') {
        if (this.notifications[name] && this.notifications[name][key]) {
          this.notifications[name][key](...payload)
        }
      } else if (action === 'response') {
        if (this.pendingRequests[id]) {
          this.pendingRequests[id](payload, error)
          delete this.pendingRequests[id]
        }
      } else if (action === 'request') {
        if (!this[key]) {
          throw new Error(`Method ${key} doesn't exist on ${name}`)
        }
        const result = await this[key](payload)
        this.send({action, name, key, id, payload: result})
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.error };
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
        "https://remix.ethereum.org",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
      ].includes(origin)
  }

  /** Send a message to source parent */
  private send(message: Partial<Message>) {
    this.source.postMessage(JSON.stringify(message), this.origin)
  }

  /** Listen on notification events from another plugin or module */
  public listen(
    name: string,
    key: string,
    cb: (...payload: any[]) => void,
  ) {
    if (!this.notifications[name]) {
      this.notifications[name] = {}
    }
    this.notifications[name][key] = cb
  }

  /** Call a method from another plugin or module */
  public call(name: string, key: string, ...payload: any): Promise<any> {
    const action = 'request'
    const id = this.id++
    const message = JSON.stringify({ action, name, key, payload, id })
    this.source.postMessage(message, this.origin)
    return new Promise((res, rej) => {
      this.pendingRequests[id] = (result: any, error?: Error) => {
        if (error) rej(new Error(`Error from IDE : ${error}`))
        res(result)
      }
    })
  }

  /** Emit an event */
  public emit<Key extends keyof T['events'] & string>(key: Key, payload: T['events'][Key]) {
    this.send({ action: 'notification', key, payload })
  }

  /** Return the current theme when handshaked */
  public loaded(): Promise<{theme: string}> {
    return new Promise((res, rej) => {
      this.handshake = (payload) => res(payload)
    })
  }
}

