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
  remixProfiles
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


export class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> {
  private id = 0
  public isLoaded = false
  public events = new EventEmitter()
  public currentRequest: PluginRequest
  public options: PluginOptions<App>
  public methods: string[]

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
      this.events.once(callName, (result: any[], error) => {
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
    this.events.emit('send', { action: 'listen', name, key, id: this.id })
  }

  /** Expose an event for the IDE */
  public emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    if (!this.isLoaded) handleConnectionError(this.options.devMode)
    this.events.emit('send', { action: 'notification', key, payload })
  }
}
