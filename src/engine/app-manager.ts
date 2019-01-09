import {
  PluginProfile,
  ModuleProfile,
  API,
  EventListeners,
  Api,
  ApiEventEmitter,
  ModuleEntry
} from '../types'
import { Plugin } from './plugin'
import { EventEmitter } from 'events'

export interface AppManager extends Api {
  type: 'appManager',
  events: {
    register: string
    activate: {profile: ModuleProfile<any>, api: API<any>},
    deactivate: ModuleProfile
  }
  registerMany(entry: ModuleEntry<any>[]): void
  registerMany(entry: ModuleEntry<any>[]): void
  registerOne<T extends Api>(entry: ModuleEntry<T>): void
  registerOne<T extends Api>(entry: ModuleEntry<T>): void
  activateMany(types: string[]): void
  deactivateMany(types: string[]): void
  activateOne(type: string): void
  deactivateOne(type: string): void
}

export abstract class AppManagerApi implements API<AppManager> {

  private eventmanager: EventListeners = {}
  private calls: {
    [type: string]: {
      [key: string]: Function
    }
  }

  /** Map module types with your implementation of this map */
  protected mapNames: { [type: string]: string }

  public readonly type = 'appManager'
  public events: ApiEventEmitter<AppManager> = new EventEmitter()

  //////////////
  // ABSTRACT //
  //////////////

  /** Method to implement: get a module from the state of the application */
  abstract getModule<T extends Api>(id: string): ModuleEntry<T>

  /** Method to implement: Should add the plugin or module to the state of the application */
  abstract addModule<T extends Api>(module: ModuleEntry<T>)

  /////////////
  // HELPERS //
  /////////////

  /** Safe method to get the type of a module in a specific implementation */
  private getType(type: string): string {
    return this.mapNames[type] || type
  }

  /** Check if profile is a plugin */
  private isPlugin(profile: ModuleProfile): profile is PluginProfile {
    return profile['url']
  }

  //////////////
  // REGISTRY //
  //////////////

  /** Register many Modules or Plugins and activate them */
  public init(entries: ModuleEntry<any>[]) {
    entries.forEach(entry => {
      this.registerOne(entry)
      this.activateOne(entry.profile.type)
    })
  }

  /** Register many Modules or Plugins */
  public registerMany(entries: ModuleEntry<any>[]) {
    entries.forEach(entry => this.registerOne(entry))
  }

  /** Register on Module or Plugin */
  public registerOne<T extends Api>(entry: ModuleEntry<T>) {
    this.addModule(entry)
    this.events.emit('register', entry.profile.type)
  }

  ////////////////
  // ACTIVATION //
  ////////////////

  /** Activate several modules or plugins */
  public activateMany(types: string[]) {
    types.forEach(type => this.activateOne(type))
  }

  /** Activate a module or plugin */
  public activateOne(type: string) {
    const id = this.getType(type)
    const { profile, api } = this.getModule(id)
    this.activateCallAndEvent(profile, api)
    if (this.isPlugin(profile)) {
      this.activateRequestAndNotification(profile, api as Plugin<any>)
    }
    if (api.activate) {
      api.activate()
    }
    this.events.emit('activate', { profile, api })
  }

  /** Activation for Module and Plugin */
  private activateCallAndEvent(profile: ModuleProfile, api: API<any>) {
    const events = profile.events || []
    events.forEach(event => {
      if (!api.events) return
      api.events.on(event, (value: any) => this.broadcast(api.type, event as string, value))
    })

    const methods = profile.methods || []
    methods.forEach((key) => {
      if (key in api) {
        this.calls[api.type][key] = (...args: any[]) => (api[key] as any)(...args)
      }
    })
  }

  /** Activation for Plugin only */
  private activateRequestAndNotification(json: PluginProfile, api: Plugin<any>) {
    api.request = ({ type, key, value }) => this.calls[type][key](value)

    const notifications = json.notifications || []
    notifications.forEach(({ type, key }) => {
      const origin = api.type
      if (!this.eventmanager[origin]) this.eventmanager[origin] = {}
      if (!this.eventmanager[origin][type]) this.eventmanager[origin][type] = {}
      this.eventmanager[origin][type][key] = api.notifs[type][key]
    })
  }

  //////////////////
  // DEACTIVATION //
  //////////////////

  /** Deactivate several modules or plugins */
  public deactivateMany(types: string[]) {
    types.forEach(type => this.deactivateOne(type))
  }

  /** Deactivate a module or plugin */
  public deactivateOne(type: string) {
    const id = this.getType(type)
    const { profile, api } = this.getModule(id)
    this.deactivateProfile(profile)
    // if (api.events) api.events.removeAllListeners()
    if (api.deactivate) api.deactivate()
    this.events.emit('deactivate', profile)
  }

  /** Deactivation for modules and plugins */
  private deactivateProfile(profile: ModuleProfile) {
    this.calls[profile.type] = {} as any

    const methods = profile.methods || []
    methods.forEach(key => delete this[profile.type][key])
  }

  ////////////////////
  // EVENTS MANAGER //
  ////////////////////

  /** Broadcast a message to every plugin listening */
  private broadcast<M extends Api, E extends keyof M['events']>(
    type: M['type'],
    key: E,
    value: M['events'][E]
  ) {
    for (const origin in this.eventmanager) {
      if (this.eventmanager[origin][type]) {
        const destination = this.eventmanager[origin][type]
        if (destination[key]) destination[key](value)
      }
    }
  }
}