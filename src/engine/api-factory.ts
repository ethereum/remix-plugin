import {
  ModuleProfile,
  Api,
  ApiEventEmitter,
  PluginRequest,
  ExtractKey,
  PluginApi,
} from 'src/types'

export abstract class ApiFactory<T extends Api = any> {
  abstract readonly profile: ModuleProfile<T>
  abstract events?: ApiEventEmitter<T>
  private requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest

  public api(): PluginApi<T> {
    return {
      events: this.events,
      name: this.profile.name,
      profile: this.profile,
      addRequest: (
        request: PluginRequest,
        method: ExtractKey<T, Function>,
        args: any[],
      ) => {
        return new Promise((resolve, reject) => {
          if (!this.profile.methods.includes(method)) {
            reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
          }
          // Add a new request to the queue
          this.requestQueue.push(async () => {
            this.currentRequest = request
            const result = await this[method as string](...args)
            resolve(result)
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
