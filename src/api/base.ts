import {
  Status,
  ModuleProfile,
  Api,
  PluginProfile,
  ApiEventEmitter,
  PluginApi,
  PluginRequest,
  ExtractKey,
  API,
} from '../types'
import { EventEmitter } from 'events'
import { extendsProfile } from './profile'


export interface IBaseApi extends Api {
  events: {
    statusChanged: (status: Status) => void
  }
  getStatus(): Status
}

export const baseProfile: ModuleProfile<IBaseApi> = {
  events: <const>['statusChanged'],
  methods: ['getStatus'],
  // TODO: move it to plugin.ts
  notifications: {
    'theme': ['switchTheme']
  }
}

export abstract class BaseApi<U extends Api> implements API<IBaseApi> {
  private status: Status
  protected requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  public readonly name: U['name']
  public readonly profile: ModuleProfile<U & IBaseApi> | PluginProfile<U & IBaseApi>
  public events: ApiEventEmitter<U & IBaseApi>
  public activate?(): Promise<void>
  public deactivate?(): void
  public render?(): HTMLElement

  constructor(profile: ModuleProfile<U> | PluginProfile<U>) {
    this.name = profile.name
    this.events = new EventEmitter() as ApiEventEmitter<U & IBaseApi>
    this.profile = extendsProfile(profile, baseProfile)
  }


  ////////////
  // STATUS //
  ////////////
  /** Set the status of the Api */
  public setStatus(status: Status) {
    this.status = status;
    (this.events as ApiEventEmitter<IBaseApi>).emit('statusChanged', status)  // needed for tsc
  }

  /** Get a snapshot of the status */
  public getStatus() {
    return this.status
  }

  /////////
  // API //
  /////////

  /** Exports an Api interface */
  public api(): PluginApi<U & IBaseApi> {
    return {
      events: this.events,
      name: this.profile.name,
      profile: this.profile,
      render: this.render ? () => (this.render as any)() : undefined,
      activate: this.activate ? () => (this.activate as any)() : undefined,
      deactivate: this.deactivate ? () => (this.deactivate as any)() : undefined,
      addRequest: (
        request: PluginRequest,
        method: ExtractKey<(U & IBaseApi), Function>,
        args: any[],
      ) => {
        return new Promise((resolve, reject) => {
          if (!this.profile.methods || !this.profile.methods.includes(method)) {
            reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
          }
          if (!(method in this)) {
            reject(new Error(`Method ${method} is not implemented by ${this.profile.name}`))
          }
          // Add a new request to the queue
          this.requestQueue.push(async () => {
            this.currentRequest = request
            try {
              const result = await this[method as string](...args)
              resolve(result)
            } catch (err) {
              reject(err)
            }
            // Remove current request and call next
            this.requestQueue.shift()
            if (this.requestQueue.length !== 0) this.requestQueue[0]()
          })
          // If there is only one request waiting, call it
          if (this.requestQueue.length === 1) {
            this.requestQueue[0]()
          }
        })
      },
    }
  }
}
