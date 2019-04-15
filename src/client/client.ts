import { EventEmitter } from 'events'
import { Api, PluginRequest } from 'src/types'

export interface PluginDevMode {
  port: number | string
}

export interface PluginOptions {
  customTheme: boolean,
  devMode: PluginDevMode
}

const defaultOptions: PluginOptions = {
  devMode: null,
  customTheme: false,
}

/** Throw an error if client try to send a message before connection */
function handleConnectionError(devMode: PluginDevMode) {
  const err = devMode
    ? `Make sure the port of the IDE is ${devMode.port}`
    : 'If you are using a local IDE, make sure to add devMode in client options'
  throw new Error(`Not connected to the IDE. ${err}`)
}

export class PluginClient<T extends Api = any> {
  private loaded = false
  private id = 0
  public events = new EventEmitter()
  public currentRequest: PluginRequest
  public devMode: PluginDevMode

  constructor(options: PluginOptions = defaultOptions) {
    this.devMode = options.devMode
  }

  // Wait until this connection is settled
  public onload(cb?: () => void): Promise<void> {
    return new Promise((res, rej) => {
      this.events.once('loaded', () => {
        this.loaded = true
        res()
        cb()
      })
    })
  }

  /** Make a call to another plugin */
  public call(name: string, key: string, ...payload: any): Promise<any> {
    if (!this.loaded) handleConnectionError(this.devMode)
    this.id++
    return new Promise((res, rej) => {
      this.events.emit('send', payload)
      this.events.once(`[${name}] ${key}-${this.id}`, (result: any[], error) => {
        error
          ? rej(new Error(`Error from IDE : ${error}`))
          : res(...result)
      })
    })
  }

  /** Listen on event from another plugin */
  public on(name: string, key: string, cb: (...payload: any[]) => void): void {
    this.events.on(`[${name}] ${key}`, cb)
  }

  /** Expose an event for the IDE */
  public emit<Key extends keyof T["events"]>(key: Key, payload: T["events"][Key]): void {
    if (!this.loaded) handleConnectionError(this.devMode)
    this.events.emit('send', { action: 'notification', key, payload })
  }
}