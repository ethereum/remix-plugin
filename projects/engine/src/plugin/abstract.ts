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
  IPluginService,
  createService,
  activateService,
  PluginBase,
  getMethodPath,
} from '../../../utils'

export interface RequestParams {
  name: string
  key: string
  payload: any[]
}

export class Plugin<T extends Api = any, App extends ApiMap = any> implements PluginBase<T, App> {
  activateService: Record<string, () => Promise<any>> = {}
  protected requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  /** Give access to all the plugins registered by the engine */
  protected app: PluginApi<App>
  // Lifecycle hooks
  onRegistration?(): void
  onActivation?(): void
  onDeactivation?(): void

  constructor(public profile: Profile<T>) {}

  get name() {
    return this.profile.name
  }

  get methods() {
    return this.profile.methods
  }

  set methods(methods: Extract<keyof T['methods'], string>[]) {
    this.profile.methods = methods
  }

  activate() {
    if (this.onActivation) this.onActivation()
  }
  deactivate() {
    if (this.onDeactivation) this.onDeactivation()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, args: any[]) {
    const path = this.currentRequest && this.currentRequest.path
    const method = getMethodPath(key, path)
    if (!(method in this)) {
      throw new Error(`Method ${method} is not implemented by ${this.profile.name}`)
    }
    return this[method](...args)
  }

  /** Add a request to the list of current requests */
  protected addRequest(request: PluginRequest, method: Profile<T>['methods'][number], args: any[]) {
    return new Promise((resolve, reject) => {
      // @todo() profiles should be manage by the plugin manager
      // if (!this.profile.methods || !this.profile.methods.includes(method)) {
      //   reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
      // }
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

  /////////////
  // SERVICE //
  /////////////

  /**
   * Create a service under the client node
   * @param name The name of the service
   * @param service The service
   */
  async createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>> {
    if (this.methods && this.methods.includes(name as any)) {
      throw new Error('A service cannot have the same name as an exposed method')
    }
    const _service = createService(name, service)
    await activateService(this, _service)
    return _service
  }

  /**
   * Prepare a service to be lazy loaded
   * @param name The name of the subservice inside this service
   * @param factory A function to create the service on demand
   */
  prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>> {
    return this.activateService[name] = async () => {
      if (this.methods && this.methods.includes(name as any)) {
        throw new Error('A service cannot have the same name as an exposed method')
      }
      const service = await factory()
      const _service = createService(name, service)
      await activateService(this as any, _service)
      delete this.activateService[name]
      return _service
    }
  }

  /** Listen on an event from another plugin */
  on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Method "on" from ${this.name} should be hooked by PluginEngine`)
  }

  /** Listen once an event from another plugin then remove event listener */
  once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Method "once" from ${this.name} should be hooked by PluginEngine`)
  }

  /** Stop listening on an event from another plugin */
  off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
  ): void {
    throw new Error(`Method "off" from ${this.name} should be hooked by PluginEngine`)
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
