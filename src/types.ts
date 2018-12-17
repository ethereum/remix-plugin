export interface Api {
  type: string
}


export abstract class API<T extends Api = any> {
  constructor(public type: T['type']) {}
}

export interface ModuleProfile<T extends Api = any> {
  type: T['type']
  methods?: (Extract<keyof T, string>)[]
  events?: (Extract<keyof T, string>)[]
}

export interface PluginProfile {
  type: string
  methods?: string[]
  events?: string[]
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

