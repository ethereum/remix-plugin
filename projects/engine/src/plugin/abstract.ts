import {
  Api,
  EventKey,
  EventParams,
  MethodKey,
  MethodParams,
  EventCallback,
  ApiMap,
  Profile,
  PluginRequest,
  PluginApi,
} from '../../../utils'

export interface RequestParams {
  name: string
  key: string
  payload: any[]
}

export abstract class Plugin<T extends Api = any, App extends ApiMap = any> {
  protected requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  /** Give access to all the plugins registered by the engine */
  protected app: PluginApi<App>
  // Lifecycle hooks
  onRegistation?(): void
  onActivation?(): void
  onDeactivation?(): void

  constructor(public profile: Profile<T>) {}

  get name() {
    return this.profile.name
  }

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
  protected addRequest(request: PluginRequest, method: Profile<T>['methods'][number], args: any[]) {
    return new Promise((resolve, reject) => {
      if (!this.profile.methods || !this.profile.methods.includes(method)) {
        reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
      }
      // Add a new request to the queue
      this.requestQueue.push(async () => {
        this.currentRequest = request
        let timedout = false
        const letcontinue = () => {
          if (timedout) reject(`call to plugin has timed out ${this.profile.name} - ${method} - ${JSON.stringify(this.currentRequest)}`)
          delete this.currentRequest
          // Remove current request and call next
          this.requestQueue.shift()
          if (this.requestQueue.length !== 0) this.requestQueue[0]()
        }

        try {
          setTimeout(() => { timedout = true, letcontinue() }, 10000)
          const result = await this.callPluginMethod(method, args)
          if (timedout) return
          resolve(result)
        } catch (err) {
          reject(err)
        }
        letcontinue()
      })
      // If there is only one request waiting, call it
      if (this.requestQueue.length === 1) {
        this.requestQueue[0]()
      }
    })
  }

  /** Listen on an event from another plugin */
  on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Method "on" from ${this.name} should be hooked by PluginEngine`)
  }

  /** Call a method of another plugin */
  async call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    throw new Error(`Method "call" from ${this.name} should be hooked by PluginEngine`)
  }

  /** Emit an event */
  emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    throw new Error(`Method "emit" from ${this.name} should be hooked by PluginEngine`)
  }
}
