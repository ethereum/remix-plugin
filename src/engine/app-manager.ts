import {
  PluginProfile,
  ModuleProfile,
  PluginEntry,
  API,
  EventListeners,
  Api,
  ApiEventEmitter,
  Entry
} from '../types'
import { Plugin } from './plugin'
import { EventEmitter } from 'events'

export interface AppManager extends Api {
  name: 'appManager',
  events: {
    register: string
    activate: Entry<Api>,
    deactivate: ModuleProfile
  }
  registerMany(entry: Entry<any>[]): void
  registerMany(entry: Entry<any>[]): void
  registerOne<T extends Api>(entry: Entry<T>): void
  registerOne<T extends Api>(entry: Entry<T>): void
  activateMany(names: string[]): void
  deactivateMany(names: string[]): void
  activateOne(name: string): void
  deactivateOne(name: string): void
}

export abstract class AppManagerApi implements API<AppManager> {

  private eventmanager: EventListeners = {}
  private calls: {
    [name: string]: {
      [key: string]: Function
    }
  } = {}

  public readonly name = 'appManager'
  public events: ApiEventEmitter<AppManager> = new EventEmitter()

  //////////////
  // ABSTRACT //
  //////////////

  /** Method to implement: get a module from the state of the application */
  abstract getEntity<T extends Api>(id: string): Entry<T>

  /** Method to implement: Should add the plugin or module to the state of the application */
  abstract addEntity<T extends Api>(module: Entry<T>): void

  /////////////
  // HELPERS //
  /////////////

  /** Check if profile is a plugin */
  private isPlugin<T extends Api>(entry: Entry<T>): entry is PluginEntry<T> {
    return entry.profile['url']
  }

  //////////////
  // REGISTRY //
  //////////////

  /** Register many Modules or Plugins and activate them */
  public init(entries: Entry<any>[]) {
    entries.forEach(entry => {
      this.registerOne(entry)
      this.activateOne(entry.profile.name)
    })
  }

  /** Register many Modules or Plugins */
  public registerMany(entries: Entry<any>[]) {
    entries.forEach(entry => this.registerOne(entry))
  }

  /** Register on Module or Plugin */
  public registerOne<T extends Api>(entry: Entry<T>) {
    this.addEntity(entry)
    this.events.emit('register', entry.profile.name)
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
    const entry = this.getEntity(name)
    this.activateCallAndEvent(entry)
    if (this.isPlugin(entry)) {
      this.activateRequestAndNotification(entry)
    }
    if (entry.api.activate) {
      entry.api.activate()
    }
    this.events.emit('activate', entry)
  }

  /** Activation for Module and Plugin */
  private activateCallAndEvent<T extends Api>({ profile, api }: Entry<T>) {
    const events = profile.events || []
    events.forEach((event) => {
      if (!api.events) return
      api.events.on(event, (value: any) => this.broadcast(api.name, event as string, value))
    })

    const methods = profile.methods || []
    this.calls[api.name] = {}
    methods.forEach((key) => {
      if ((key) in api) {
        this.calls[api.name][key as string] = (...args: any[]) => (api[key as string])(...args)
      }
    })
  }

  /** Activation for Plugin only */
  private activateRequestAndNotification<T extends Api>({ profile, api }: PluginEntry<T>) {
    api.request = ({ name, key, value }) => this.calls[name][key](value)

    const notifications = profile.notifications || []
    notifications.forEach(({ name, key }) => {
      const origin = api.name
      if (!this.eventmanager[origin]) this.eventmanager[origin] = {}
      if (!this.eventmanager[origin][name]) this.eventmanager[origin][name] = {}
      this.eventmanager[origin][name][key] = api.notifs[name][key]
    })
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
    const { profile, api } = this.getEntity(name)
    this.deactivateProfile(profile)
    // if (api.events) api.events.removeAllListeners()
    if (api.deactivate) api.deactivate()
    this.events.emit('deactivate', profile)
  }

  /** Deactivation for modules and plugins */
  private deactivateProfile(profile: ModuleProfile) {
    this.calls[profile.name] = {} as any

    const methods = profile.methods || []
    methods.forEach(key => delete this[profile.name][key])
  }

  ////////////////////
  // EVENTS MANAGER //
  ////////////////////

  /** Broadcast a message to every plugin listening */
  private broadcast<M extends Api, E extends keyof M['events']>(
    name: M['name'],
    key: E,
    value: M['events'][E]
  ) {
    for (const origin in this.eventmanager) {
      if (this.eventmanager[origin][name]) {
        const destination = this.eventmanager[origin][name]
        if (destination[key]) destination[key](value)
      }
    }
  }
}