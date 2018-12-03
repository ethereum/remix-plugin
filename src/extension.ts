import { Message } from './remix-module'

export class RemixExtension {
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

  private getMessage(event: MessageEvent) {
    if (!event.data) return
    if (typeof event.data !== 'string') return
    const msg = JSON.parse(event.data) as Message
    if (!msg) return

    const { action, key, type, value } = msg
    if (action === 'notification') {
      if (this.notifications[key] && this.notifications[key][type]) {
        this.notifications[key][type](value)
      }
    } else if (action === 'response') {
      const { id, error } = msg
      if (this.pendingRequests[id]) {
        this.pendingRequests[id](value, error)
        delete this.pendingRequests[id]
      }
    }
  }

  public listen(
    type: string,
    key: string,
    cb: (value: any) => void,
  ) {
    if (!this.notifications[type]) {
      this.notifications[type] = {}
    }
    this.notifications[type][key] = cb
  }

  public call(type: string, key: string, params: any): Promise<any> {
    const action = 'request'
    const id = this.id++
    const value = params
    const message = JSON.stringify({ action, type, key, value, id })
    window.parent.postMessage(message, '*')
    return new Promise((res, rej) => {
      this.pendingRequests[this.id] = (result: any, error?: Error) => {
        if (error) rej(error)
        if (!error) res(result)
      }
    })
  }
}
