import { ExternalProfile, Profile } from '../../../utils/src/types/profile'
import { Message } from '../../../utils/src/types/message'
import { Plugin } from './abstract'

/** List of available gateways for decentralised storage */
export const defaultGateways = {
  'ipfs://': 'https://ipfsgw.komputing.org/ipfs/',
  'swarm://': 'https://swarm-gateways.net/bzz-raw://'
}

/** Transform the URL to use a gateway if decentralised storage is specified */
export function transformUrl(url: string) {
  const network = Object.keys(defaultGateways).find(key => url.startsWith(key))
  return network ? url.replace(network, defaultGateways[network]) : url
}


export abstract class ExternalPlugin extends Plugin {
  protected loaded: boolean
  protected id = 0
  protected pendingRequest: Record<number, (result: any, error: Error | string) => void> = {}
  profile: Profile & ExternalProfile
  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  protected abstract postMessage(message: Partial<Message>): void

  deactivate() {
    this.loaded = false
    super.deactivate()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[] = []): Promise<any> {
    const action = 'request'
    const id = this.id++
    const requestInfo = this.currentRequest
    const name = this.name
    const promise = new Promise((res, rej) => {
      this.pendingRequest[id] = (result: any[], error: Error | string) => error ? rej (error) : res(result)
    })
    this.postMessage({ id, action, key, payload, requestInfo, name })
    return promise
  }

  /** Perform handshake with the client if not loaded yet */
  protected async handshake() {
    if (!this.loaded) {
      this.loaded = true
      const methods: string[] = await this.callPluginMethod('handshake', [this.profile.name])
      this.call('manager', 'updateProfile', this.profile)
      if (methods) {
        this.profile.methods = methods
      }
    }
  }

  /**
   * React when a message comes from client
   * @param message The message sent by the client
   */
  protected async getMessage(message: Message) {
    // Check for handshake request from the client
    if (message.action === 'request' && message.key === 'handshake') {
      // Handshake if not loaded yet. We don't need to return message to client
      return this.handshake()
    }

    switch (message.action) {
      // Start listening on an event
      case 'on':
      case 'listen': {
        const { name, key } = message
        const action = 'notification'
        this.on(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
        break
      }
      case 'off': {
        const { name, key } = message
        this.off(name, key)
        break
      }
      case 'once': {
        const { name, key } = message
        const action = 'notification'
        this.once(name, key, (...payload) => this.postMessage({ action, name, key, payload }))
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
}
