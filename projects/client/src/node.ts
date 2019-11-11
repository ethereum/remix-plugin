import { PluginClient } from "./client"

/**
 * Access a service of an external plugin
 */
export class PluginNode {

  /**
   * @param path Path to external plugin
   * @param client The main client used in this plugin
   */
  constructor(private path: string, private client: PluginClient) {}

  async get(name: string) {
    return new PluginNode(`${this.path}.${name}`, this.client)
  }

  /** Call a method of the node */
  call(method: string, ...payload: any[]) {
    return this.client.call(this.path as any, method, payload)
  }

  /**
   * Listen to an event from the plugin
   * @note Event are trigger at the root level yet, not on a specific node
   */
  on(method: string, cb: Function) {
    // Events are triggered at the root level for now
    this.client.on(this.path.split('.').shift() as any, method, cb)
  }
}