import { EventEmitter } from 'events'
import {
  Api,
  PluginRequest,
  ApiMap,
  EventKey,
  EventCallback,
  MethodParams,
  MethodKey,
  EventParams,
  ProfileMap,
  callEvent,
  listenEvent,
  RemixApi,
  remixProfiles,
  createService,
  activateService,
  IPluginService,
  PluginBase
} from '../../utils'

export interface PluginDevMode {
  /** Port for localhost */
  port: number | string
  origins: string | string[]
}

/** Options of the plugin client */
export interface PluginOptions<T extends ApiMap> {
  customTheme: boolean
  customApi: ProfileMap<T>
  /** options only available for dev mode */
  devMode: Partial<PluginDevMode>
}

export const defaultOptions: Partial<PluginOptions<any>> = {
  customTheme: false,
  customApi: remixProfiles,
  devMode: { port: 8080, origins: [] },
}

/** Throw an error if client try to send a message before connection */
export function handleConnectionError(devMode?: Partial<PluginDevMode>) {
  const err = devMode
    ? `Make sure the port of the IDE is ${devMode.port}`
    : 'If you are using a local IDE, make sure to add devMode in client options'
  throw new Error(`Not connected to the IDE. ${err}`)
}


export class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> implements PluginBase<T, App> {
  private id = 0
  public isLoaded = false
  public events = new EventEmitter()
  public currentRequest: PluginRequest
  public options: PluginOptions<App>
  public name: string // name is set on handshake
  public methods: string[]
  public activateService: Record<string, () => Promise<any>> = {}

  constructor(options: Partial<PluginOptions<App>> = {}) {
    this.options = {
      ...defaultOptions,
      ...options
    } as PluginOptions<App>
    this.events.once('loaded', () => this.isLoaded = true)
  }

  // Wait until this connection is settled
  public onload(cb?: () => void): Promise<void> {
    return new Promise((res, rej) => {
      const loadFn = () => {
        res()
        if (cb) cb()
      }
      this.isLoaded ? loadFn() : this.events.once('loaded', () => loadFn())
    })
  }

  /**
   * Ask the plugin manager if current request can call a specific method
   * @param method The method to call
   * @param message An optional message to show to the user
   */
  canCallMethod(method: MethodKey<T>, message?: string): Promise<boolean> {
    if (this.currentRequest?.from && this.methods.includes(method)) {
      const from = this.currentRequest.from
      const to = this.name
      return (this as any).call('manager', 'canCall', from, to, method, message)
    } else {
      return Promise.resolve(false)
    }
  }

  //////////////////////
  // CALL / ON / EMIT //
  //////////////////////

  /** Make a call to another plugin */
  public call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    if (!this.isLoaded) handleConnectionError(this.options.devMode)
    this.id++
    return new Promise((res, rej) => {
      const callName = callEvent(name, key, this.id)
      this.events.once(callName, (result: any, error) => {
        error
          ? rej(new Error(`Error from IDE : ${error}`))
          : res(result)
      })
      this.events.emit('send', { action: 'request', name, key, payload, id: this.id })
    })
  }

  /** Listen on event from another plugin */
  public on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    const eventName = listenEvent(name, key)
    this.events.on(eventName, cb)
    this.events.emit('send', { action: 'on', name, key, id: this.id })
  }

  /** Listen once on event from another plugin */
  public once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    const eventName = listenEvent(name, key)
    this.events.once(eventName, cb)
    this.events.emit('send', { action: 'once', name, key, id: this.id })
  }

  /** Remove all listeners on an event from an external plugin */
  public off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
  ): void {
    const eventName = listenEvent(name, key)
    this.events.removeAllListeners(eventName)
    this.events.emit('send', { action: 'off', name, key, id: this.id })
  }


  /** Expose an event for the IDE */
  public emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    if (!this.isLoaded) handleConnectionError(this.options.devMode)
    this.events.emit('send', { action: 'emit', key, payload })
  }


  /////////////
  // SERVICE //
  /////////////

  /**
   * Create a service under the client node
   * @param name The name of the service
   * @param service The service
   */
  async createService<S extends Record<string, any>>(name: string, service: IPluginService<S>) {
    if (this.methods && this.methods.includes(name)) {
      throw new Error('A service cannot have the same name as an exposed method')
    }
    const _service = createService(name, service)
    await activateService(this as any, _service)
    return _service
  }

  /**
   * Prepare a service to be lazy loaded
   * @param name The name of the subservice inside this service
   * @param factory A function to create the service on demand
   */
  prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>> {
    return this.activateService[name] = async () => {
      if (this.methods && this.methods.includes(name)) {
        throw new Error('A service cannot have the same name as an exposed method')
      }
      const service = await factory()
      const _service = createService(name, service)
      await activateService(this as any, _service)
      delete this.activateService[name]
      return _service
    }
  }

  //////////
  // NODE //
  //////////

}
