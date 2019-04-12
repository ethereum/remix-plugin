import { BaseStore } from '../store'
import { PluginRequest } from '../types'

/////////////
// OPTIONS //
/////////////

export interface PluginConnection {
  origin: string
  source: Window
  isLoaded: boolean
}

export interface PluginOptions {
  customTheme: boolean,
  devMode: {
    port: number | string
  }
}

interface Notifications {
  [name: string]: {
    [key: string]: (...payload: any[]) => void
  }
}

export interface PluginApi {
  id: number,
  notifications: Notifications
  currentRequest: PluginRequest
  pendingRequests: {
    [id: number]: (result: any, error?: Error) => void
  }
}



export type PluginState = PluginConnection & PluginOptions & PluginApi

export const initialPluginState: PluginState = {
  // connection
  origin: null,
  source: null,
  isLoaded: false,
  // Options
  customTheme: false,
  devMode: null,
  // api
  id: 0,
  pendingRequests: {},
  notifications: {},
  currentRequest: null
}

export class PluginStore extends BaseStore<PluginState> {

  constructor(options?: PluginOptions) {
    super({ ...initialPluginState, ...options })
  }

  addRequest(id: number, request: (result: any, error?: Error) => void) {
    this.state.pendingRequests[id] = request
  }
  removeRequest(id: number) {
    delete this.state.pendingRequests[id]
  }

  addNotification(name: string, key: string, cb: (result: any, error?: Error) => void) {
    if (!this.state.notifications[name]) {
      this.state.notifications[name] = {}
    }
    this.state.notifications[name][key] = cb
  }
}