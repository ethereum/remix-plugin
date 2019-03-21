import {
  ModuleProfile,
  API,
  EventListeners,
  Api,
  ApiEventEmitter,
  PluginRequest,
  PluginApi,
  IPermissionHandler,
} from '../types'
import { EventEmitter } from 'events'
import { Plugin } from './plugin'

export interface AppManager extends Api {
  name: 'appManager'
  events: {
    register: string
    activate: PluginApi<Api>
    deactivate: ModuleProfile
  }
  registerMany(entry: PluginApi<any>[]): void
  registerMany(entry: PluginApi<any>[]): void
  registerOne<T extends Api>(entry: PluginApi<T>): void
  registerOne<T extends Api>(entry: PluginApi<T>): void
  activateMany(names: string[]): void
  deactivateMany(names: string[]): void
  activateOne(name: string): void
  deactivateOne(name: string): void
}

export abstract class AppManagerApi implements API<AppManager> {
  abstract permissionHandler: IPermissionHandler
  private eventmanager: EventListeners = {}
  private calls: {
    [name: string]: {
      [key: string]: (requestInfo: PluginRequest, ...payload: any[]) => Promise<any>
    }
  } = {}

  public readonly name = 'appManager'
  public events: ApiEventEmitter<AppManager> = new EventEmitter()

  //////////////
  // ABSTRACT //
  //////////////

  /** Method to implement: get a module from the state of the application */
  abstract getEntity<T extends Api>(name: string): PluginApi<T>

  /** Method to implement: Should add the plugin or module to the state of the application */
  abstract addEntity<T extends Api>(api: PluginApi<T>): void

  /** Method to implement: Do something when module or plugin is activated or deactivated */
  abstract setActive(name: string, isActive: boolean): void

  /////////////
  // HELPERS //
  /////////////

  /** Check if profile is a plugin */
  private isPlugin<T extends Api>(api: PluginApi<T>): api is Plugin<T> {
    return api.profile['url']
  }

  //////////////
  // REGISTRY //
  //////////////

  /** Register many Modules or Plugins and activate them */
  public init(entries: PluginApi<any>[]) {
    entries.forEach(api => {
      api.profile.required = true
      this.registerOne(api)
      this.activateOne(api.profile.name)
    })
  }

  /** Register many Modules or Plugins */
  public registerMany(entries: PluginApi<any>[]) {
    entries.forEach(api => this.registerOne(api))
  }

  /** Register on Module or Plugin */
  public registerOne<T extends Api>(api: PluginApi<T>) {
    // Add a default location is provided by the AppManager update the profile with it
    if (!api.profile['location'] && this['defaultLocation']) {
      api.profile['location'] = this['defaultLocation']
    }
    this.addEntity(api)
    this.events.emit('register', api.profile.name)
  }

  ////////////////
  // ACTIVATION //
  ////////////////

  /** Activate several modules or plugins */
  public activateMany(names: string[]) {
    names.forEach(name => this.activateOne(name))
  }

  /** Activate a module or plugin */
  public activateOne(name: string) {
    const api = this.getEntity(name)
    this.activateCallAndEvent(api)
    if (this.isPlugin(api)) {
      this.activateRequestAndNotification(api)
    }
    if (!this.isPlugin(api) && api.activate) {
      api.activate()
    }
    this.setActive(name, true)
    this.events.emit('activate', api)
  }

  /** Activation for Module and Plugin */
  private activateCallAndEvent<T extends Api>(api: PluginApi<T>) {
    const events = api.profile.events || []
    events.forEach((event: keyof T['events']) => {
      if (!api.events) return
      api.events.on(event, (...payload: any[]) =>
        this.broadcast(api.name, event as string, payload),
      )
    })

    const methods = api.profile.methods || []
    this.calls[api.name] = {}
    methods.forEach(key => {
      this.calls[api.name][key as string] = (request: PluginRequest, ...payload: any[]) => {
        return api.addRequest(request, key, payload)
      }
    })
  }

  /** Activation for Plugin only */
  private activateRequestAndNotification<T extends Api>(api: Plugin<T>) {
    api.request = async ({ name, key, payload }) => {
      try {
        // Check permission if the module ask for it
        const to = this.getEntity(name)
        if (to.profile.permission) {
          await this.permissionHandler.askPermission(api.profile, to.profile)
        }
        // Manage request and payload
        if (!Array.isArray(payload)) payload = [payload]
        const requestInfo: PluginRequest = { from: api.name }
        return this.calls[name][key](requestInfo, ...payload)
      } catch (err) {
        throw err
      }
    }

    const notifications = api.profile.notifications || {}
    for (const name in notifications) {
      const origin = api.profile.name
      if (!this.eventmanager[origin]) this.eventmanager[origin] = {}
      if (!this.eventmanager[origin][name]) this.eventmanager[origin][name] = {}
      const keys = notifications[name] || []
      keys.forEach(key => {
        this.eventmanager[origin][name][key] = api.notifs[name][key]
      })
    }
  }

  //////////////////
  // DEACTIVATION //
  //////////////////

  /** Deactivate several modules or plugins */
  public deactivateMany(names: string[]) {
    names.forEach(name => this.deactivateOne(name))
  }

  /** Deactivate a module or plugin */
  public deactivateOne(name: string) {
    const api = this.getEntity(name)
    this.deactivateProfile(name)
    // if (api.events) api.events.removeAllListeners()
    if (api.deactivate) api.deactivate()
    this.setActive(name, false)
    this.events.emit('deactivate', api.profile)
  }

  /** Deactivation for modules and plugins */
  private deactivateProfile(name: string) {
    delete this.calls[name]
  }

  ////////////////////
  // EVENTS MANAGER //
  ////////////////////

  /** Broadcast a message to every plugin listening */
  private broadcast<M extends Api, E extends keyof M['events']>(
    name: M['name'],
    key: E,
    payload: M['events'][E],
  ) {
    for (const origin in this.eventmanager) {
      if (this.eventmanager[origin][name]) {
        const destination = this.eventmanager[origin][name]
        if (destination[key]) destination[key](payload)
      }
    }
  }
}
