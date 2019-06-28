import { Plugin } from '../plugin'
import { PluginRequest, listenEvent, ApiMap, IframeProfile, Api } from '../../../utils'
import { IPermissionHandler } from './persmission'

/** Transform an map of Api into a Map of Plugin. Used by PluginEngine for constructor */
export type PluginMap<T extends ApiMap> = {
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
  permissionHandler: IPermissionHandler,
  natives: string[]
}

function defaultEngineSettings(settings: Partial<PluginEngineSettings>) {
  return {
    autoActivate: false,
    natives: [],
    ...settings
  }
}

abstract class AbstractPluginEngine {
  protected methods: ExposedMethods
  protected events: ExposedEvents
  protected listeners: EventRecord
  protected permissionHandler: IPermissionHandler
  abstract register(plugins: Plugin | Plugin[]): void
  abstract activate(names: string | string[]): void
  abstract deactivate(names: string | string[]): void

  abstract setSettings(settings: Partial<PluginEngineSettings>): void
  abstract setSettings<K extends keyof PluginEngineSettings>(
    keyOrSetting: K | Partial<PluginEngineSettings>,
    value?: PluginEngineSettings[K]
  ): void

  // Hooks
  onRegistration?(plugin: Plugin): void
  onActivation?(plugin: Plugin): void
  onDeactivation?(plugin: Plugin): void
}

/**
 * Plugin Engine register, activate and deactive plugins.
 * It broadcasts events and redirect calls.
 */
export class PluginEngine<T extends ApiMap> extends AbstractPluginEngine {
  protected settings: Partial<PluginEngineSettings>
  protected plugins: PluginMap<T> = {} as PluginMap<T>
  protected methods: ExposedMethods = {}
  protected events: ExposedEvents = {}
  protected listeners: EventRecord = {}

  constructor(
    plugins: Partial<PluginMap<T>>,
    settings: Partial<PluginEngineSettings> = {}
  ) {
    super()
    this.settings = defaultEngineSettings(settings)
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

  /** Either it's not an IframeProfile or it's */
  private isNative(profile: Partial<IframeProfile>) {
    return !profile.url || this.settings.natives.includes(profile.name)
  }

  //////////////
  // SETTINGS //
  //////////////
  /** Update settings of the engine */
  public setSettings(settings: Partial<PluginEngineSettings>): void
  public setSettings<K extends keyof PluginEngineSettings>(key: K, value?: PluginEngineSettings[K]): void
  public setSettings<K extends keyof PluginEngineSettings>(
    keyOrSetting: K | Partial<PluginEngineSettings>,
    value?: PluginEngineSettings[K]
  ): void {
    typeof keyOrSetting === 'string'
      ? this.settings = {...this.settings, [keyOrSetting]: value }
      : this.settings = {...this.settings, ...keyOrSetting }
  }

  //////////////
  // REGISTER //
  //////////////

  public register(plugins: Plugin | Plugin[]): void {
    (Array.isArray(plugins))
      ? plugins.forEach(plugin => this.registerOne(plugin))
      : this.registerOne(plugins)
  }

  private registerOne(plugin: Plugin<Api, T>) {
    if (this.plugins[plugin.name]) return // Plugin already registered
    if (!plugin.profile) {
      throw new Error(`Plugin ${(plugin as Plugin).name} doesn't match the plugin interface`)
    }
    this.plugins[plugin.name as keyof T] = plugin

    // Call Hooks
    if (this.onRegistration) this.onRegistration(plugin)
    if (plugin.onRegistation) plugin.onRegistation()
  }

  //////////////
  // ACTIVATE //
  //////////////

  /** Activate one or several plugins */
  public activate(names: Extract<keyof T, string> | Extract<keyof T, string>[]) {
    (Array.isArray(names))
      ? names.forEach(name => this.activateOne(name))
      : this.activateOne(names)
  }

  /** Activate one plugin */
  private activateOne(name: string) {
    if (this.isActive(name)) return // Plugin already activated
    if (!this.isRegistered(name)) {
      throw new Error(`Plugin ${name} is not register yet. It cannot be activated`)
    }
    const plugin = this.plugins[name]

    // EXPOSES METHODS
    this.methods[name] = {}
    if (plugin.profile.methods) {
      plugin.profile.methods.forEach(method => {
        this.methods[name][method] = (request: PluginRequest, ...payload: any[]) => {
          return plugin['addRequest'](request, method, payload)
        }
      })
    }

    // LISTEN ON CALL
    async function call(pluginName: string, key: string, ...payload: any[]) {
      if (!this.isRegistered(pluginName)) {
        throw new Error(`Cannot call ${pluginName} from ${name}, because ${pluginName} is not registered`)
      }

      const to: Plugin = this.plugins[pluginName]
      const isNative = this.isNative(plugin.profile)

      // Check permission: If throw, it should not activate the plugin
      if (this.settings.permissionHandler && !isNative) {
        if (to.profile.permission) {
          const isAllowed = await this.settings.permissionHandler.askPermission(plugin.profile, to.profile)
          if (!isAllowed) {
            throw new Error(`Plugin "${name}" don't have permission to call method "${key}" of plugin "${pluginName}"`)
          }
        }
      }
      // Check if active: If autoActivate is enabled and if plugin is native, activate pluginName
      if (!this.isActive(pluginName)) {
        if (this.settings.autoActivate && isNative) {
          if (this.settings.permissionHandler) {
            this.settings.permissionHandler.onActivation(plugin.profile, to.profile)
          }
          this.activateOne(pluginName)
        } else {
          throw new Error(`Cannot call ${pluginName} from ${name}, because ${pluginName} is not activated yet`)
        }
      }

      if (!this.methods[pluginName][key]) {
        throw new Error(`Cannot call method ${key} of ${pluginName} from ${name}, because ${key} is not exposed`)
      }

      const request = { from: name }
      return this.methods[pluginName][key](request, ...payload)
    }
    plugin['call'] = call.bind(this)

    // LISTEN ON EVENTS
    this.events[name] = {}
    function on(pluginName: string, event: string, cb: (...payload: any[]) => void) {
      const eventName = listenEvent(pluginName, event)
      // If not already listening
      if (!this.events[name][eventName]) {
        this.events[name][eventName] = cb
      }
      // Record that "name" is listening on "pluginName"
      if (!this.listeners[eventName]) this.listeners[eventName] = []
      // If not already recorded
      if (!this.listeners[eventName].includes(name)) {
        this.listeners[eventName].push(name)
      }
    }
    plugin['on'] = on.bind(this)

    // FORWARD EVENTS
    function emit(event: string, ...payload: any[]) {
      const eventName = listenEvent(name, event)
      if (!this.listeners[eventName]) return // Nobody is listening
      const listeners = this.listeners[eventName] || []
      listeners.forEach(listener => {
        if (!this.events[listener][eventName]) {
          throw new Error(`Plugin ${listener} should be listening on event ${event} from ${name}. But no callback have been found`)
        }
        this.events[listener][eventName](...payload)
      })
    }
    plugin['emit'] = emit.bind(this)

    // GIVE ACCESS TO APP
    const app = Object.keys(this.plugins).reduce((acc, pluginName) => ({
      ...acc,
      [pluginName]: this.plugins[pluginName].profile.methods.reduce((methods, method) => ({
        ...methods,
        [method]: call.bind(this, pluginName, method)
      }), {
        on: on.bind(this, pluginName)
      })
    }), {})
    plugin['app'] = Object.freeze(app)

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
  private deactivateOne(name: string) {
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
    Object.keys(this.listeners).forEach(eventName => {
      this.listeners[eventName].forEach((listener, i) => {
        if (listener === name) this.listeners[eventName].splice(i, 1)
      })
    })

    // REMOVE PLUGIN APP
    delete plugin['app']

    // Call hooks
    if (this.onDeactivation) this.onDeactivation(plugin)
    plugin.deactivate()
  }

}