import { Plugin } from './engine/plugin'

export type ExtractKey<T, U> =  { [K in keyof T]: T[K] extends U ? K : never }[keyof T]

export interface Api {
  name: string
  events: {
    [key: string]: any
  }
}

export type ApiListener<T> = (arg: T) => void

/** Override the EventEmitter type to take into account the Api */
export interface ApiEventEmitter<T extends Api> {
  setMaxListeners(n: number): this
  emit<K extends keyof T['events']>(name: K, arg: T['events'][K]): boolean
  addListener<K extends keyof T['events']>(name: K, listener: ApiListener<T['events'][K]>): this
  on<K extends keyof T['events']>(name: K, listener: ApiListener<T['events'][K]>): this
  once<K extends keyof T['events']>(name: K, listener: ApiListener<T['events'][K]>): this
  removeListener<K extends keyof T['events']>(name: K, listener: ApiListener<T['events'][K]>): this
  removeAllListeners<K extends keyof T['events']>(name?: K): this
  listeners<K extends keyof T['events']>(name: K): ApiListener<T['events'][K]>[]
  listenerCount<K extends keyof T['events']>(name: K): number
}

export type API<T extends Api> = {
  name: T['name']
  events?: ApiEventEmitter<T>
  activate?(): void
  deactivate?(): void
} & {
  [M in ExtractKey<T, Function>]: T[M]
}

export interface ModuleProfile<T extends Api = any> {
  name: T['name']
  methods?: ExtractKey<T, Function>[]
  events?: (keyof T['events'])[]
}

export interface PluginProfile<T extends Api = any> extends ModuleProfile<T> {
  notifications?: { name: string; key: string }[]
  url: string
  loadIn?: { name: string; key: string } // The module used to load the iframe in
}

/* ---- MESSAGES ---- */

/** A message send to / from an iframed plugin */
export interface Message {
  id: number
  action: 'notification' | 'request' | 'response'
  name: string
  key: string
  payload: any
  error?: Error
}

/** A specific message that manage event */
export interface EventMessage {
  name: string
  key: string
  payload: any
}

/* ---- APP MANAGER ---- */

export interface IAppManager {
  modules: {
    [name: string]: Api
  }
  plugins: {
    [name: string]: Api
  }
}

/** the list of  */
export interface EventListeners {
  [origin: string]: {
    [name: string]: {
      [key: string]: (payload: any) => void
    }
  }
}

/** List of calls methods inside an AppManager */
export type AppCalls<T extends IAppManager> = {
  [name in (keyof T['modules'] | keyof T['plugins'])]: T['modules'][name] extends undefined
  ? {
    [key in ExtractKey<T['plugins'][name], Function>]: T['plugins'][name][key]
  }
  : {
    [key in ExtractKey<T['modules'][name], Function>]: T['modules'][name][key]
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
export type ModuleList<T extends { [name: string]: Api }> = Entry<T[keyof T]>[]

/** A map of module entries depending on the type of the module */
export type ModuleStore<T extends { [name: string]: Api }> = {
  [name in keyof T]: Entry<T[name]>
}

/* ---- IFRAME ---- */
/** An Api for plugin that add notifications */
export interface PluginApi<App extends IAppManager> extends Api {
  notifications: {
    [name in keyof App['modules']]: Notifications<App['modules'][name]>
  }
}

/** The name of the event and it's name */
export type Notifications<T extends Api> = {
  [key in keyof T['events']]: T['events'][key]
}