export type ExtractKey<T, U> =  { [K in keyof T]: T[K] extends U ? K : never }[keyof T]

export interface Api {
  type: string
  events: {
    [key: string]: any
  }
}

export type ApiListener<T> = (arg: T) => void

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
  activate(): void
  deactivate(): void
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


export interface Message {
  id: number
  action: 'notification' | 'request' | 'response'
  type: string
  key: string
  value: any
  error?: Error
}

export interface EventMessage {
  type: string
  key: string
  value: any
}


export interface EventListeners {
  [origin: string]: {
    [type: string]: {
      [key: string]: (value: any) => void
    }
  }
}

export interface IAppManager {
  modules: {
    [type: string]: Api
  }
  plugins: {
    [type: string]: Api
  }
}

export interface ModuleEntry<T extends Api> {
  json: ModuleProfile<T>
  api: API<T>
}

export type ModuleList<T extends { [type: string]: Api}> = ModuleEntry<T[keyof T]>[]

export type ModuleStore<T extends { [type: string]: Api}> = {
  [type in keyof T]: ModuleEntry<T[type]>
}
