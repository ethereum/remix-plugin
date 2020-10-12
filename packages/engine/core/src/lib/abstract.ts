import type {
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
  PluginBase,
  IPluginService,
} from '@remixproject/plugin-utils'

import { 
  createService,
  activateService,
  getMethodPath,
} from '@remixproject/plugin-utils'

export interface RequestParams {
  name: string
  key: string
  payload: any[]
}

export interface PluginOptions {
  /** The time to wait for a call to be executed before going to next call in the queue */
  queueTimeout?: number
}

export class Plugin<T extends Api = any, App extends ApiMap = any> implements PluginBase<T, App> {
  activateService: Record<string, () => Promise<any>> = {}
  protected requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  /** Give access to all the plugins registered by the engine */
  protected app: PluginApi<App>
  protected options: PluginOptions = {}
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

  activate(): any | Promise<any> {
    if (this.onActivation) this.onActivation()
  }
  deactivate(): any | Promise<any> {
    if (this.onDeactivation) this.onDeactivation()
  }

  setOptions(options: Partial<PluginOptions> = {}) {
    this.options = { ...this.options, ...options }
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

        const ref = setTimeout(() => { timedout = true, letcontinue() }, this.options.queueTimeout || 10000)
        try {
          const result = await this.callPluginMethod(method, args)
          if (timedout) return
          delete this.currentRequest
          resolve(result)
        } catch (err) {
          reject(err)
        }
        clearTimeout(ref)
        letcontinue()
      })
      // If there is only one request waiting, call it
      if (this.requestQueue.length === 1) {
        this.requestQueue[0]()
      }
    })
  }


  /**
   * Ask the plugin manager if current request can call a specific method
   * @param method The method to call
   * @param message An optional message to show to the user
   */
  askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean> {
    // Internal call
    if (!this.currentRequest) {
      return Promise.resolve(true)
    }
    // External call
    if (this.methods.includes(method)) {
      const from = this.currentRequest.from
      const to = this.name
      return (this as any).call('manager', 'canCall', from, to, method, message)
    } else {
      return Promise.resolve(false)
    }
  }

  /**
   * Called by the engine when a plugin try to activate it
   * @param from the profile of the plugin activating this plugin
   * @param method method used to activate this plugin if any
   */
  async canActivate(from: Profile, method?: string): Promise<boolean> {
    return true
  }

  /**
   * Called by the engine when a plugin try to deactivate it
   * @param from the profile of the plugin deactivating this plugin
   */
  async canDeactivate(from: Profile): Promise<boolean> {
    return true
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
    throw new Error(`Cannot use method "on" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Listen once an event from another plugin then remove event listener */
  once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Cannot use method "once" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Stop listening on an event from another plugin */
  off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
  ): void {
    throw new Error(`Cannot use method "off" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Call a method of another plugin */
  async call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    throw new Error(`Cannot use method "call" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Emit an event */
  emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    throw new Error(`Cannot use method "emit" from plugin "${this.name}". It is not registered in the engine yet.`)
  }
}
