import { Plugin } from './engine/plugin'

export type StrictExtractKey<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]
export type ExtractKey<T, U> = StrictExtractKey<T, U>

/////////
// API //
/////////

export interface Api {
  name: string
  events: {
    [key: string]: (...args: any[]) => void
  }
  methods: {
    [key: string]: (...args: any[]) => void
  }
}

/** Override the EventEmitter type to take into account the Api */
export interface ApiEventEmitter<T extends Api> {
  setMaxListeners(n: number): this
  emit<K extends keyof T['events']>(name: K, ...arg: Parameters<T['events'][K]>): boolean
  addListener<K extends keyof T['events']>(
    name: K,
    listener: T['events'][K],
  ): this
  on<K extends keyof T['events']>(
    name: K,
    listener: T['events'][K],
  ): this
  once<K extends keyof T['events']>(
    name: K,
    listener: T['events'][K],
  ): this
  removeListener<K extends keyof T['events']>(
    name: K,
    listener: T['events'][K],
  ): this
  removeAllListeners<K extends keyof T['events']>(name?: K): this
  listeners<K extends keyof T['events']>(name: K): T['events'][K][]
  listenerCount<K extends keyof T['events']>(name: K): number
}

///////////////////////
/* ---- PROFILE ---- */
///////////////////////

export type API<T extends Api> = {
  name: T['name']
  events: ApiEventEmitter<T>
  activate?(): Promise<void>
  deactivate?(): void
  render?(): HTMLElement
} & {
  [M in keyof T['methods']]: T['methods'][M]
}

export interface ModuleProfile<T extends Api = any> {
  name: T['name']
  displayName?: string
  description?: string,
  required?: boolean
  kind?: 'fs' | 'compiler' | 'editor' | 'udapp' | 'network' | 'test' | 'analysis' | 'debug'
  methods?: readonly Extract<keyof T['methods'], string>[]
  events?: readonly Extract<keyof T['events'], string>[],
  notifications?: ({ [name: string]: string[] }) | { [name: string]: string[] }
  permission?: boolean
}

export interface PluginProfile<T extends Api = any> extends ModuleProfile<T> {
  name: T['name'],
  url: string
  hash?: string
  location?: string // The name of the module used to load the iframe in
  version?: string
  contributors?: {
    name: string,
    email: string,
    url: string
  }
  homepage?: string
  bugs?: {
    url: string,
    email: string
  }
  repository?: {
    type: 'git',
    url: string
  }
  required?: false
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
  events: ApiEventEmitter<T>
  addRequest: (
    request: PluginRequest,
    method: Extract<keyof T['methods'], string>,
    args: any[]) => Promise<any>
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
//////////////////////

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


//////////////////////
/* ---- STATUS ---- */
//////////////////////
export interface Status {
  /** Name of the icon from font-awesome */
  key: string
  /** Bootstrap css variable to use */
  type: 'success' | 'info' | 'warning' | 'danger'
  /** Describe long version of the status */
  title?: string
}