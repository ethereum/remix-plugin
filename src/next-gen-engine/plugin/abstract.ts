export interface RequestParams {
  name: string,
  key: string,
  payload: any[]
}

export interface PluginRequest {
  from: string
}

export interface Profile {
  name: string
  methods: string[]
  permission?: boolean
}

export interface IPlugin<P extends Profile = any> {
  name: string
  profile: Profile

  // Queue requests
  addRequest(request: PluginRequest, method: P['methods'][number], args: any[]): Promise<any>

  // Interaction functions
  on(name: string, key: string, cb: (payload: any[]) => void): void
  call(name: string, key: string, payload: any[]): Promise<any>
  emit(key: string, payload: any[]): void

  // Lifecycle trigger
  activate(): void
  deactivate(): void

  // Lifecycle hooks
  onRegistation?(): void
  onActivation?(): void
  onDeactivation?(): void
}



export abstract class Plugin implements IPlugin {
  readonly name: string
  protected requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  // Lifecycle hooks
  onRegistation?(): void
  onActivation?(): void
  onDeactivation?(): void

  constructor(public profile: Profile) {}

  activate() {
    if (this.onActivation) this.onActivation()
  }
  deactivate() {
    if (this.onDeactivation) this.onDeactivation()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(method: string, args: any[]) {
    if (!(method in this)) {
      throw new Error(`Method ${method} is not implemented by ${this.profile.name}`)
    }
    return this[method](...args)
  }

  /** Add a request to the list of current requests */
  addRequest(
    request: PluginRequest,
    method: Profile['methods'][number], // Extract<keyof , string>,
    args: any[],
  ) {
    return new Promise((resolve, reject) => {
      if (!this.profile.methods || !this.profile.methods.includes(method)) {
        reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
      }
      // Add a new request to the queue
      this.requestQueue.push(async () => {
        this.currentRequest = request
        try {
          const result = await this.callPluginMethod(method, args)
          resolve(result)
        } catch (err) {
          reject(err)
        }
        delete this.currentRequest
        // Remove current request and call next
        this.requestQueue.shift()
        if (this.requestQueue.length !== 0) this.requestQueue[0]()
      })
      // If there is only one request waiting, call it
      if (this.requestQueue.length === 1) {
        this.requestQueue[0]()
      }
    })
  }

  // Interaction functions
  on(name: string, key: string, cb: (...payload: any[]) => void) {
    throw new Error(`Method "listen" from ${this.name} should be hooked by PluginEngine`)
  }
  async call(name: string, key: string, ...payload: any[]) {
    throw new Error(`Method "call" from ${this.name} should be hooked by PluginEngine`)
  }
  emit(key: string, ...payload: any[]) {
    throw new Error(`Method "emit" from ${this.name} should be hooked by PluginEngine`)
  }

}

