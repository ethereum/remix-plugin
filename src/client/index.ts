import { Request, Notif } from '../types'

export class RemixExtension {

    private _notifications: any
    private _pendingRequests: any
    private _id: number

  constructor () {
    this._notifications = {}
    this._pendingRequests = {}
    this._id = 0
    window.addEventListener('message', event => this._newMessage(event), false)
  }

  private _newMessage(event: MessageEvent) {
    if (!event.data) { return }
    if (typeof event.data !== 'string') { return }

    let msg
    try {
      msg = JSON.parse(event.data)
    } catch (e) {
      return console.log('unable to parse data')
    }
    const {action, key, type, value} = msg
    if (action === 'notification') {
      if (this._notifications[key] && this._notifications[key][type]) {
        this._notifications[key][type](value)
      }
    } else if (action === 'response') {
      const {id, error} = msg
      if (this._pendingRequests[id]) {
        this._pendingRequests[id](error, value)
        delete this._pendingRequests[id]
      }
    }
  }

 public listen<
    Key extends keyof Notif,
    Type extends keyof Notif[Key],
    CB extends Notif[Key][Type]
>(key: Key, type: Type, callback: CB) {
    if (!this._notifications[key]) { this._notifications[key] = {} }
    this._notifications[key][type] = callback
}


  public call<
    Key extends keyof Request,
    Type extends keyof Request[Key],
    Params extends Request[Key][Type]['params'],
    CB extends Request[Key][Type]['cb'],
  >(key: Key, type: Type, params: Params, callback: CB) {
    this._id++
    this._pendingRequests[this._id] = callback
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key,
      type,
      value: params,
      id: this._id
    }), '*')
  }


}

// if (window) (window as any).RemixExtension = RemixExtension
// if (module && module.exports) module.exports = RemixExtension
