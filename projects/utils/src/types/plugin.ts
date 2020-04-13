import { EventCallback, MethodParams, MethodKey, EventKey, Api, ApiMap, EventParams } from './api'
import { IPluginService } from '../service'
import { IPluginManager } from '../api'

export interface PluginBase<T extends Api = any, App extends ApiMap = any> {
  methods: string[]
  activateService: Record<string, () => Promise<IPluginService>>
  /** Listen on an event from another plugin */
  on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void

  /** Listen once an event from another plugin then remove event listener */
  once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void

  /** Stop listening on an event from another plugin */
  off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
  ): void

  /** Call a method of another plugin */
  call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<any>
  /** Emit an event */
  emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void
}
