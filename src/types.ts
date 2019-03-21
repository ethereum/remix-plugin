import { Plugin } from './engine/plugin'

export type StrictExtractKey<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]
export type ExtractKey<T, U> = StrictExtractKey<T, U> | string

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
  addListener<K extends keyof T['events']>(
    name: K,
    listener: ApiListener<T['events'][K]>,
  ): this
  on<K extends keyof T['events']>(
    name: K,
    listener: ApiListener<T['events'][K]>,
  ): this
  once<K extends keyof T['events']>(
    name: K,
    listener: ApiListener<T['events'][K]>,
  ): this
  removeListener<K extends keyof T['events']>(
    name: K,
    listener: ApiListener<T['events'][K]>,
  ): this
  removeAllListeners<K extends keyof T['events']>(name?: K): this
  listeners<K extends keyof T['events']>(name: K): ApiListener<T['events'][K]>[]
  listenerCount<K extends keyof T['events']>(name: K): number
}

export type API<T extends Api> = {
  name: T['name']
  events?: ApiEventEmitter<T>
  activate?(): void
  deactivate?(): void
} & { [M in StrictExtractKey<T, Function>]: T[M] }

export interface ModuleProfile<T extends Api = any> {
  name: T['name']
  displayName?: string
  required?: boolean
  kind?: 'compile' | 'run' | 'test' | 'analysis' | 'debug'
  methods?: ExtractKey<T, Function>[]
  events?: (keyof T['events'])[]
  permission?: boolean
}

export interface PluginProfile<T extends Api = any> extends ModuleProfile<T> {
  required?: false
  notifications?: {
    [name: string]: string[]
  }
  url: string
  hash?: string
  location?: string // The name of the module used to load the iframe in
}

////////////////////////
/* ---- MESSAGES ---- */
////////////////////////

/** A message send to / from an iframed plugin */
export interface Message {
  id: number
  action: 'notification' | 'request' | 'response'
  name: string
  key: string
  payload: any
  requestInfo: PluginRequest
  error?: Error
}

/** A specific message that manage event */
export interface EventMessage {
  name: string
  key: string
  payload: any
}

////////////////////////////
/* --- PLUGIN REQUEST --- */
////////////////////////////
export interface PluginRequest {
  from: string
}

export interface PluginApi<T extends Api> {
  profile: ModuleProfile<T> | PluginProfile<T>
  name: T['name']
  events?: ApiEventEmitter<T>
  addRequest: (request: PluginRequest, method: ExtractKey<T, Function>, args: any[]) => Promise<any>
  render?: () => HTMLElement,
  activate?: () => Promise<void>
  deactivate?: () => void
}

///////////////////////////
/* ---- APP MANAGER ---- */
//////////////////////////

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
  [name in
    | keyof T['modules']
    | keyof T['plugins']]: T['modules'][name] extends undefined
    ? {
        [key in StrictExtractKey<
          T['plugins'][name],
          Function
        >]: T['plugins'][name][key]
      }
    : {
        [key in StrictExtractKey<
          T['modules'][name],
          Function
        >]: T['modules'][name][key]
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

//////////////////////
/* ---- IFRAME ---- */
/////////////////////

/** The name of the event and it's name */
export type Notifications<T extends Api> = {
  [key in keyof T['events']]: T['events'][key]
}

/////////////////////////
/* ---- PERMISSION --- */
/////////////////////////

export interface Permissions {
  [to: string]: {
    [from: string]: {
      allow: boolean
      hash: string
    }
  }
}

export interface IPermissionHandler {
  /** The list of the current permissions */
  permissions: Permissions
  /** Ask the Permission to the user */
  askPermission(from: PluginProfile, to: ModuleProfile): Promise<void>
}
