import { Plugin, Profile } from './plugin'
import { PluginRequest, listenEvent } from '../utils'
import { ApiMap } from './api'


/** Transform an map of Api into a Map of Plugin. Used by PluginEngine for constructor */
type PluginMap<T extends ApiMap> = {
  [name in keyof T]: Plugin<T[name]>
}

/** The list of methods exposed by the PluginEngine */
interface ExposedMethods {
  [name: string]: {
    [key: string]: (requestInfo: PluginRequest, ...payload: any[]) => Promise<any>
  }
}

/** The list of events exposed by the PluginEngine */
interface ExposedEvents {
  [recipient: string]: {
    [eventName: string]: (...payload: any[]) => void
  }
}

/** A record of which plugin is listening on which event */
interface EventRecord {
  [eventName: string]: string[]
}

/** Optional settings of the PluginEngine */
export interface PluginEngineSettings {
  autoActivate: boolean
  permissionHandler: PermissionHandler
}

/** Used to ask permission to use a plugin */
export interface PermissionHandler {
  askPermission: (from: Profile, to: Profile) => Promise<boolean>
}

abstract class AbstractPluginEngine {
  protected methods: ExposedMethods
  protected events: ExposedEvents
  protected eventsRecord: EventRecord
  protected permissionHandler: PermissionHandler
  abstract register(plugins: Plugin | Plugin[]): void
  abstract activate(names: string | string[]): void
  abstract deactivate(names: string | string[]): void

  // Hooks
  onRegistration?(plugin: Plugin): void
  onActivation?(plugin: Plugin): void
  onDeactivation?(plugin: Plugin): void
}

/**
 * Plugin Engine register, activate and deactive plugins.
 * It broadcasts events and redirect calls.
 */
export class PluginEngine<T extends Readonly<ApiMap>> extends AbstractPluginEngine {
  protected settings: Partial<PluginEngineSettings>
  protected plugins: PluginMap<T> = {} as PluginMap<T>
  protected methods: ExposedMethods = {}
  protected events: ExposedEvents = {}
  protected eventsRecord: EventRecord = {}

  constructor(
    plugins: PluginMap<T>,
    settings: Partial<PluginEngineSettings> = {}
  ) {
    super()
    this.settings = settings
    this.register(Object.keys(plugins).map(key => plugins[key]))
  }

  public get actives(): string[] {
    return Object.keys(this.methods)
  }

  /////////////
  // HELPERS //
  /////////////
  private isRegistered(name: string): boolean {
    return !!this.plugins[name]
  }

  private isActive(name: string): boolean {
    return !!this.methods[name]
  }

  //////////////
  // REGISTER //
  //////////////

  public register(plugins: Plugin | Plugin[]): void {
    (Array.isArray(plugins))
      ? plugins.forEach(plugin => this.registerOne(plugin))
      : this.registerOne(plugins)
  }

  private registerOne(plugin: Plugin) {
    if (this.plugins[plugin.name]) return // Plugin already registered
    if (!(plugin instanceof Plugin)) {
      throw new Error(`Plugin ${(plugin as Plugin).name} doesn't match the plugin interface`)
    }
    this.plugins[plugin.name] = plugin

    // Call Hooks
    if (this.onRegistration) this.onRegistration(plugin)
    if (plugin.onRegistation) plugin.onRegistation()
  }

  //////////////
  // ACTIVATE //
  //////////////

  /** Activate one or several plugins */
  public activate(names: string | string[]) {
    (Array.isArray(names))
      ? names.forEach(name => this.activateOne(name))
      : this.activateOne(names)
  }

  /** Activate one plugin */
  private activateOne(name: string) {
    if (this.isActive(name)) return // Plugin already activated
    if (!this.isRegistered[name]) {
      throw new Error(`Plugin ${name} is not register yet. It cannot be activated`)
    }
    const plugin = this.plugins[name]

    // EXPOSES METHODS
    this.methods[name] = {}
    if (plugin.profile.methods) {
      plugin.profile.methods.forEach(method => {
        this.methods[name][method] = (request: PluginRequest, ...payload: any[]) => {
          return plugin.addRequest(request, method, payload)
        }
      })
    }

    // LISTEN ON CALL
    plugin['call'] = async (pluginName: string, key: string, ...payload: any[]) => {
      if (!this.isRegistered(pluginName)) {
        throw new Error(`Cannot call ${pluginName} from ${name}, because ${pluginName} is not registered`)
      }
      // Check permission: If throw, it should not activate the plugin
      if (this.settings.permissionHandler) {
        const to = this.plugins[name]
        if (to.profile.permission) {
          const isAllowed = await this.permissionHandler.askPermission(plugin.profile, to.profile)
          if (!isAllowed) return
        }
      }
      // Check if active. If autoActivate is enabled, activate pluginName
      if (!this.isActive(pluginName)) {
        throw new Error(`Cannot call ${pluginName} from ${name}, because ${pluginName} is not activated yet`)
        /* @todo: Add this for autoactivation of plugin
        if (this.settings.autoActivate) {
          this.activateOne(pluginName)
        } else {
          throw new Error(`Cannot call ${pluginName} from ${name}, because ${pluginName} is not activated yet`)
        }*/
      }
      if (!this.methods[pluginName][key]) {
        throw new Error(`Cannot call method ${key} of ${pluginName} from ${name}, because ${key} is not exposed`)
      }
      const request = { from: name }
      return this.methods[pluginName][key](request, ...payload)
    }

    // LISTEN ON EVENTS
    this.events[name] = {}
    plugin['on'] = async (pluginName: string, event: string, cb: (...payload: any[]) => void) => {
      const eventName = listenEvent(pluginName, event)
      // If not already listening
      if (!this.events[name][eventName]) {
        this.events[name][eventName] = cb
      }
      // Record that "name" is listening on "pluginName"
      if (!this.eventsRecord[eventName]) this.eventsRecord[eventName] = []
      // If not already recorded
      if (this.eventsRecord[eventName].includes(name)) {
        this.eventsRecord[eventName].push(name)
      }
    }

    // FORWARD EVENTS
    plugin['emit'] = (event: string, ...payload: any[]) => {
      const eventName = listenEvent(name, event)
      if (this.eventsRecord[eventName]) return // Nobody is listening
      const listeners = this.eventsRecord[eventName]
      listeners.forEach(listener => {
        if (this.events[listener][eventName]) {
          throw new Error(`Plugin ${listener} should be listening on event ${event} from ${name}. But no callback have been found`)
        }
        this.events[listener][eventName](...payload)
      })
    }

    // Call hooks
    if (this.onActivation) this.onActivation(plugin)
    plugin.activate()
  }

  //////////////////
  // DEACTIVATION //
  //////////////////

  /** Deactivate one or several plugins */
  public deactivate(names: string | string[]) {
    (Array.isArray(names))
      ? names.forEach(name => this.deactivateOne(name))
      : this.deactivateOne(names)
  }

  /** Deactivate one plugin */
  deactivateOne(name: string) {
    const plugin = this.plugins[name]

    // REMOVE CALL / LISTEN / EMIT
    const deactivatedWarning = () => {
      throw new Error(`Plugin ${name} is currently deactivated. Activate it to use this method`)
    }
    plugin['call'] = deactivatedWarning
    plugin['on'] = deactivatedWarning
    plugin['emit'] = deactivatedWarning

    // REMOVE EXPOSED METHODS
    delete this.methods[name]

    // REMOVE LISTENER
    // Note : We don't remove the listeners of this plugin.
    // Because we would keep track of them to reactivate them on reactivation. Which doesn't make sense
    delete this.events[name]

    // REMOVE EVENT RECORD
    Object.keys(this.eventsRecord).forEach(eventName => {
      this.eventsRecord[eventName].forEach((listener, i) => {
        if (listener === name) this.eventsRecord[eventName].splice(i, 1)
      })
    })

    // Call hooks
    if (this.onDeactivation) this.onDeactivation(plugin)
    plugin.deactivate()
  }

}