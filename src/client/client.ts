import { EventEmitter } from 'events'
import { Api, PluginRequest } from '../types'

export interface PluginDevMode {
  port: number | string
}

export interface PluginOptions {
  customTheme: boolean,
  devMode?: PluginDevMode
}

export const defaultOptions: PluginOptions = {
  customTheme: false,
}

/** Throw an error if client try to send a message before connection */
export function handleConnectionError(devMode?: PluginDevMode) {
  const err = devMode
    ? `Make sure the port of the IDE is ${devMode.port}`
    : 'If you are using a local IDE, make sure to add devMode in client options'
  throw new Error(`Not connected to the IDE. ${err}`)
}

/** Create the name of the event for a call */
export function callEvent(name: string, key: string, id: number) {
  return `[${name}] ${key}-${id}`
}

/** Create the name of the event for a listen */
export function listenEvent(name: string, key: string) {
  return `[${name}] ${key}`
}

export class PluginClient<T extends Api = any> {
  private loaded = false
  private id = 0
  private loadedCB: () => void
  public events = new EventEmitter()
  public currentRequest: PluginRequest
  public devMode: PluginDevMode

  constructor(options: PluginOptions = defaultOptions) {
    if (options.devMode) this.devMode = options.devMode
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
      this.loaded
        ? loadFn()
        : this.loadedCB = loadFn
    })
  }

  /** Make a call to another plugin */
  public call(name: string, key: string, ...payload: any): Promise<any> {
    if (!this.loaded) handleConnectionError(this.devMode)
    this.id++
    return new Promise((res, rej) => {
      this.events.emit('send', { action: 'request', name, key, payload, id: this.id })
      const eventName = callEvent(name, key, this.id)
      this.events.once(eventName, (result: any[], error) => {
        const resultArray = Array.isArray(result) ? result : [result]
        error
          ? rej(new Error(`Error from IDE : ${error}`))
          : res(...resultArray)
      })
    })
  }

  /** Listen on event from another plugin */
  public on(name: string, key: string, cb: (...payload: any[]) => void): void {
    const eventName = listenEvent(name, key)
    this.events.on(eventName, cb)
  }

  /** Expose an event for the IDE */
  public emit<Key extends keyof T["events"]>(key: Key, payload: T["events"][Key]): void {
    if (!this.loaded) handleConnectionError(this.devMode)
    this.events.emit('send', { action: 'notification', key, payload })
  }
}