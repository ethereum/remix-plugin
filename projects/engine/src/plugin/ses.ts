import { Plugin } from './abstract'
import { Message, ExternalProfile, Profile } from '../../../utils'
import { lockdown } from 'ses'

interface PluginPendingRequest {
  [id: number]: (result: any, error: Error | string) => void
}


declare class Compartment {
  constructor({ host: any })
  evaluate(code: string): any
}

declare function harden<T>(params: T): T

export type SesProfile = Profile & ExternalProfile

export class SesPlugin extends Plugin {
  private id = 0
  private pendingRequest: PluginPendingRequest = {}
  private compartment: Compartment
  private code$: Promise<string>

  constructor(public profile: SesProfile) {
    super(profile)
    lockdown()
    this.code$ = fetch(profile.url).then(res => res.text())
  }

  async activate() {
    this.compartment =  new Compartment({
      host: {
        send: (message: Partial<Message>) => this.getMessage(message),
        on: (cb: (msg: Partial<Message>) => void) => this.postMessage = cb
      }
    })
    const code = await this.code$
    this.compartment.evaluate(code)
    const methods: string[] = await this.callPluginMethod('handshake', [this.profile.name])
    if (methods) {
      this.profile.methods = methods
      this.call('manager', 'updateProfile', this.profile)
    }
    super.activate()
  }

  deactivate() {
    this.postMessage = () => {
      throw new Error(`Plugin ${this.name} is deactivated`)
    }
    // delete this.compartment
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
  private async getMessage(message: Partial<Message>) {

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
    throw new Error(`Plugin "${this.name}" has not been activated yet`)
  }

}