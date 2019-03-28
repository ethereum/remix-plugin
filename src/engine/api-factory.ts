import {
  ModuleProfile,
  Api,
  ApiEventEmitter,
  PluginRequest,
  ExtractKey,
  PluginApi,
} from '../types'
import { createProfile } from '../services'

export abstract class ApiFactory<T extends Api = any> {
  abstract readonly profile: ModuleProfile<T>
  private requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  public events?: ApiEventEmitter<T>
  public activate?: () => Promise<void>
  public deactivate?: () => void
  public render?: () => HTMLElement


  public api(): PluginApi<T> {
    return {
      events: this.events,
      name: this.profile.name,
      profile: createProfile(this.profile),
      render: this.render ? () => (this.render as any)() : undefined,
      activate: this.activate ? () => (this.activate as any)() : undefined,
      deactivate: this.deactivate ? () => (this.deactivate as any)() : undefined,
      addRequest: (
        request: PluginRequest,
        method: ExtractKey<T, Function>,
        args: any[],
      ) => {
        return new Promise((resolve, reject) => {
          if (!this.profile.methods || !this.profile.methods.includes(method)) {
            reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
          }
          if (!(method in this)) {
            reject(new Error(`Method ${method} is not implemented by ${this.profile.name}`))
          }
          // Add a new request to the queue
          this.requestQueue.push(async () => {
            this.currentRequest = request
            try {
              const result = await this[method as string](...args)
              resolve(result)
            } catch (err) {
              reject(err)
            }
            // Remove current request and call next
            this.requestQueue.shift()
            if (this.requestQueue.length !== 0) this.requestQueue[0]()
          })
          // If there is only one request waiting, call it
          if (this.requestQueue.length === 1) {
            this.requestQueue[0]()
          }
        })
      },
    }
  }
}
