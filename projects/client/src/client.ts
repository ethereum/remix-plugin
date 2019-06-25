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
  devMode: PluginDevMode
}

export const defaultOptions: Partial<PluginOptions<any>> = {
  customTheme: false,
  customApi: {},
}

/** Throw an error if client try to send a message before connection */
export function handleConnectionError(devMode?: PluginDevMode) {
  const err = devMode
    ? `Make sure the port of the IDE is ${devMode.port}`
    : 'If you are using a local IDE, make sure to add devMode in client options'
  throw new Error(`Not connected to the IDE. ${err}`)
}


export class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> {
  private loaded = false
  private id = 0
  private loadedCB: () => void
  public events = new EventEmitter()
  public currentRequest: PluginRequest
  public options: PluginOptions<App>

  constructor(options: Partial<PluginOptions<App>> = {}) {
    this.options = {
      ...defaultOptions,
      ...options
    } as PluginOptions<App>
    this.events.once('loaded', () => {
      this.loaded = true
      if (this.loadedCB) this.loadedCB()
    })
  }

  // Wait until this connection is settled
  public onload(cb?: () => void): Promise<void> {
    return new Promise((res, rej) => {
      const loadFn = () => {
        res()
        if (cb) cb()
      }
      this.loaded ? loadFn() : (this.loadedCB = loadFn)
    })
  }

  /** Make a call to another plugin */
  public call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    if (!this.loaded) handleConnectionError(this.options.devMode)
    this.id++
    return new Promise((res, rej) => {
      const eventName = callEvent(name, key, this.id)
      this.events.once(eventName, (result: any[], error) => {
        const resultArray = Array.isArray(result) ? result : [result]
        error ? rej(new Error(`Error from IDE : ${error}`)) : res(...resultArray)
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
  }

  /** Expose an event for the IDE */
  public emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    if (!this.loaded) handleConnectionError(this.options.devMode)
    this.events.emit('send', { action: 'notification', key, payload })
  }
}
