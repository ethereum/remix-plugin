import { EventEmitter } from 'events'
import { PluginClient } from '../dist'

/**
 * A node that forward the call to the right path
 */
class PluginService {
  private methods: string[]

  constructor(private path: string, private client: PluginClient) {
    this.name = path.split('.').pop()
    this.client.methods = [
      ...this.client.methods,
      ...this.methods
    ]
    this.client.call('manager', 'updateProfile', { methods: this.client.methods})
    this.methods.forEach(method => this.client[`${this.path}.${method}`] = this[method].bind(this))
  }

  /** Add a service */
  create(name: string) {
    const path = `${this.path}.${name}`
    return new PluginService(path, this.client)
  }

}


/**
 * Access a service of an external plugin
 */
class PluginNode {

  constructor(private path: string, private client: PluginClient) {}

  async get(name: string) {
    return new PluginNode(`${this.path}.${name}`, this.client)
  }

  call(method: string, ...payload: any[]) {
    this.client.call(this.path, method, payload)
  }

  on() {
    // To implement
  }

  emit() {
    // To implement
  }
}