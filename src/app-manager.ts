import { PluginProfile, ModuleProfile, API } from './types'
import { Plugin } from './plugin'

export class AppManager {
  events = {}

  constructor(dependancies: {
    modules?: { json: ModuleProfile; api: API }[]
    plugins?: { json: PluginProfile; api: Plugin }[]
  }) {
    // Modules
    const modules = dependancies.modules || []
    modules.forEach(({ json, api }) => this.addApi(json, api))

    // Plugins
    const plugins = dependancies.plugins || []
    plugins.forEach(({ json, api }) => {
      this.addApi(json, api)

      api.request = ({ type, key, value }) => this[type][key](value)

      const notifications = json.notifications || []
      notifications.forEach(({ type, key }) => {
        if (!this.events[api.type]) this.events[api.type] = {}
        if (!this.events[api.type][type]) this.events[api.type][type] = {}
        this.events[api.type][type][key] = api.notifs[type][key]
      })
    })
  }

  /** Add an api to the AppModule */
  private addApi(json: ModuleProfile, api: API) {
    this[api.type] = {}

    const events = json.events || []
    events.forEach(event => {
      if (event in api) {
        api[event].on((value: any) => {
          this.broadcast(api.type, event, value)
        })
      }
    })

    const methods = json.methods || []
    methods.forEach(key => {
      if (key in api) {
        this[api.type][key] = api[key]
      }
    })
  }

  private broadcast(type: string, key: string, value: any) {
    for (const origin in this.events) {
      if (this.events[origin][type]) {
        const destination = this.events[origin][type]
        if (destination[key]) destination[key](value)
      }
    }
  }

  /** Activate a plugin */
  public activate(type: string) {
    if (!this[type]) throw new Error(`Plugin ${type} is not registered yet`)
    this[type].activate()
    // TODO : this.addApi()
  }

  /** Deactivate a plugin */
  public deactivate(type: string) {
    if (!this[type]) throw new Error(`Plugin ${type} is not registered yet`)
    this[type].deactivate()
    // TODO : this.removeApi()
  }
}


/*
export interface InternalModuleConfig<T extends ModuleProfile = any> {
  [type: string]: T
}
export interface ExternalModuleConfig<T extends IframeProfile = any> {
  [type: string]: T
}

export interface AppConfig {
  modules: InternalModuleConfig
  plugins: ExternalModuleConfig
  providers: any
}

export type InternalConfig<C extends AppConfig> = {
  [key in keyof C['modules']]: Profile<C['modules'][key]>
}
export type ExternalConfig<C extends AppConfig> = {
  [key in keyof C['plugins']]: ExternalProfile<C['plugins'][key]>
}
export interface ProfileConfig<C extends AppConfig> {
  modules?: InternalConfig<C>
  plugins?: ExternalConfig<C>
  providers: any
}

export type InternalMethods<C extends AppConfig> = {
  [key in keyof C['modules']]: C['modules'][key]['methods']
}
export type ExternalMethods<C extends AppConfig> = {
  [key in keyof C['plugins']]: C['plugins'][key]['methods']
}
export type ManagerMethods<C extends AppConfig> = InternalMethods<C> & ExternalMethods<C>


export type InternalDefinition<C extends AppConfig> = {
  [key in keyof C['modules']]: Module<C['modules'][key]>
}
export type ExternalDefinition<C extends AppConfig> = {
  [key in keyof C['plugins']]: Plugin<C['plugins'][key]>
}
export type ManagerDefinition<C extends AppConfig> = InternalDefinition<C> & ExternalDefinition<C>
*/