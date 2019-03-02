import {
  ModuleProfile,
  PluginEntry,
  API,
  EventListeners,
  Api,
  ApiEventEmitter,
  Entry,
} from '../types'
import { EventEmitter } from 'events'

export interface AppManager extends Api {
  name: 'appManager'
  events: {
    register: string
    activate: Entry<Api>
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

/**
 * AppManager can implement a default location for plugin to be rendered
 * `name` is the name of the module to call
 * `key` is the name of the method exposed by the module
 * The method should accept an `HTMLElement` as payload
 */
export interface DefaultLocation {
  defaultLocation: {
    name: string
    key: string
  }
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
  abstract getEntity<T extends Api>(name: string): Entry<T>

  /** Method to implement: Should add the plugin or module to the state of the application */
  abstract addEntity<T extends Api>(entry: Entry<T>): void

  /** Method to implement: Do something when module or plugin is activated or deactivated */
  abstract setActive(name: string, isActive: boolean): void

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
      entry.profile.required = true
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
    // Add a default location is provided by the AppManager update the profile with it
    if (!entry.profile['location'] && this['defaultLocation']) {
      entry.profile['location'] = this['defaultLocation']
    }
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
    this.setActive(name, true)
    this.events.emit('activate', entry)
  }

  /** Activation for Module and Plugin */
  private activateCallAndEvent<T extends Api>({ profile, api }: Entry<T>) {
    const events = profile.events || []
    events.forEach(event => {
      if (!api.events) return
      api.events.on(event, (...payload: any[]) =>
        this.broadcast(profile.name, event as string, payload),
      )
    })

    const methods = profile.methods || []
    this.calls[profile.name] = {}
    methods.forEach(key => {
      if (key in api) {
        this.calls[profile.name][key as string] = (...args: any[]) =>
          api[key as string](...args)
      }
    })
  }

  /** Activation for Plugin only */
  private activateRequestAndNotification<T extends Api>({
    profile,
    api,
  }: PluginEntry<T>) {
    api.request = ({ name, key, payload }) => {
      if (!Array.isArray(payload)) payload = [payload]
      return this.calls[name][key](...payload)
    }

    const notifications = profile.notifications || {}
    for (const name in notifications) {
      const origin = profile.name
      if (!this.eventmanager[origin]) this.eventmanager[origin] = {}
      if (!this.eventmanager[origin][name]) this.eventmanager[origin][name] = {}
      const keys = notifications[name] || []
      keys.forEach(
        key => (this.eventmanager[origin][name][key] = api.notifs[name][key]),
      )
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
    const { profile, api } = this.getEntity(name)
    this.deactivateProfile(name)
    // if (api.events) api.events.removeAllListeners()
    if (api.deactivate) api.deactivate()
    this.setActive(name, false)
    this.events.emit('deactivate', profile)
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
