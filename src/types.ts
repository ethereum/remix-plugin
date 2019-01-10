import { Plugin } from './engine/plugin'

export type ExtractKey<T, U> =  { [K in keyof T]: T[K] extends U ? K : never }[keyof T]

export interface Api {
  type: string
  events: {
    [key: string]: any
  }
}

export type ApiListener<T> = (arg: T) => void

/** Override the EventEmitter type to take into account the Api */
export interface ApiEventEmitter<T extends Api> {
  setMaxListeners(n: number): this
  emit<K extends keyof T['events']>(type: K, arg: T['events'][K]): boolean
  addListener<K extends keyof T['events']>(type: K, listener: ApiListener<T['events'][K]>): this
  on<K extends keyof T['events']>(type: K, listener: ApiListener<T['events'][K]>): this
  once<K extends keyof T['events']>(type: K, listener: ApiListener<T['events'][K]>): this
  removeListener<K extends keyof T['events']>(type: K, listener: ApiListener<T['events'][K]>): this
  removeAllListeners<K extends keyof T['events']>(type?: K): this
  listeners<K extends keyof T['events']>(type: K): ApiListener<T['events'][K]>[]
  listenerCount<K extends keyof T['events']>(type: K): number
}

export type API<T extends Api> = {
  type: T['type']
  events?: ApiEventEmitter<T>
  activate?(): void
  deactivate?(): void
} & {
  [M in ExtractKey<T, Function>]: T[M]
}

export interface ModuleProfile<T extends Api = any> {
  type: T['type']
  methods?: ExtractKey<T, Function>[]
  events?: (keyof T['events'])[]
}

export interface PluginProfile<T extends Api = any> extends ModuleProfile<T> {
  notifications?: { type: string; key: string }[]
  url: string
  loadIn?: { type: string; key: string } // The module used to load the iframe in
}

/* ---- MESSAGES ---- */

/** A message send to / from an iframed plugin */
export interface Message {
  id: number
  action: 'notification' | 'request' | 'response'
  type: string
  key: string
  value: any
  error?: Error
}

/** A specific message that manage event */
export interface EventMessage {
  type: string
  key: string
  value: any
}

/* ---- APP MANAGER ---- */

export interface IAppManager {
  modules: {
    [type: string]: Api
  }
  plugins: {
    [type: string]: Api
  }
}

/** the list of  */
export interface EventListeners {
  [origin: string]: {
    [type: string]: {
      [key: string]: (value: any) => void
    }
  }
}

/** List of calls methods inside an AppManager */
export type AppCalls<T extends IAppManager> = {
  [type in (keyof T['modules'] | keyof T['plugins'])]: T['modules'][type] extends undefined
  ? {
    [key in ExtractKey<T['plugins'][type], Function>]: T['plugins'][type][key]
  }
  : {
    [key in ExtractKey<T['modules'][type], Function>]: T['modules'][type][key]
  }
}

/** The data needed by the AppManager to add a module */
export interface ModuleEntry<T extends Api> {
  profile: ModuleProfile<T>
  api: API<T>
}
/** The data needed by the AppManager to add a plugin */
export interface PluginEntry<T extends Api> {
  profile: PluginProfile<T>
  api: Plugin<T>
}

export type Entry<T extends Api> = ModuleEntry<T> | PluginEntry<T>

/** A list of module entries */
export type ModuleList<T extends { [type: string]: Api }> = Entry<T[keyof T]>[]

/** A map of module entries depending on the type of the module */
export type ModuleStore<T extends { [type: string]: Api }> = {
  [type in keyof T]: Entry<T[type]>
}

/* ---- IFRAME ---- */
/** An Api for plugin that add notifications */
export interface PluginApi<App extends IAppManager> extends Api {
  notifications: {
    [type in keyof App['modules']]: Notifications<App['modules'][type]>
  }
}

/** The name of the event and it's type */
export type Notifications<T extends Api> = {
  [key in keyof T['events']]: T['events'][key]
}