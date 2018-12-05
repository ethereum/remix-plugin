import { Message, EventMessage, RemixModule, ModuleProfile, Profile } from './remix-module'
import { Module } from './module'
import { Plugin, IframeProfile, ExternalProfile } from './plugin'


export class AppManager<C extends AppConfig = any> {

  public calls: ManagerMethods<C>
  public modules: ManagerDefinition<C>

  public events: {
    [origin: string]: {
      [type: string]: {
        [key: string]: (value: any) => any
      }
    }
  } = {}

  constructor() {}

  /**
   * Create a Module Manager and instanciate all the modules
   * @param config List of module profile
   */
  static create<Config extends AppConfig>(config?: ProfileConfig<Config>) {
    const manager = new AppManager<Config>()
    if (!config) return manager
    manager.modules = {} as any
    manager.calls = {} as any
    // Create Modules
    if (config.modules) {
      for (const type in config.modules) {
        const module = new Module(config.modules[type], manager, config.providers[type]) as any
        manager.modules[type] = module
        manager.calls[type] = module.calls
      }
    }
    // Create Plugins
    if (config.plugins) {
      for (const type in config.plugins) {
        const module = new Plugin(config.plugins[type], manager) as any
        manager.modules[type] = module
        manager.calls[type] = module.calls
      }
    }

    return manager
  }

  /** Add a module to the module manager */
  public addModule(module: RemixModule) {
    this.modules[module.type] = (module as any)
  }

  /** Remove a module from the module manager */
  public removeModule(module: RemixModule) {
    delete this.modules[module.type]
  }

  /** Add an event listen from a module to another */
  public addEvent(origin: string, type: string, key: string, cb: (value: any) => any) {
    this.events[origin][type][key] = cb
  }

  /** Remove an event listen from a module */
  public removeEvent(origin: string, type: string, key: string) {
    delete this.events[origin][type][key]
  }

  /** Call a specific module */
  public call(message: Message): Promise<any> {
    return this.modules[message.type].call(message)
  }

  /** Broadcast an event to all module listening */
  public broadcast({ type, key, value }: EventMessage) {
    Object.keys(this.events).forEach(origin => {
      const module = this.events[origin][type]
      if (!!module && !!module[key]) {
        this.events[origin][type][key](value)
      }
    })
  }
}



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

/* Config */
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

/* Methods */
export type InternalMethods<C extends AppConfig> = {
  [key in keyof C['modules']]: C['modules'][key]['methods']
}
export type ExternalMethods<C extends AppConfig> = {
  [key in keyof C['plugins']]: C['plugins'][key]['methods']
}
export type ManagerMethods<C extends AppConfig> = InternalMethods<C> & ExternalMethods<C>


/* Module Instances */
export type InternalDefinition<C extends AppConfig> = {
  [key in keyof C['modules']]: Module<C['modules'][key]>
}
export type ExternalDefinition<C extends AppConfig> = {
  [key in keyof C['plugins']]: Plugin<C['plugins'][key]>
}
export type ManagerDefinition<C extends AppConfig> = InternalDefinition<C> & ExternalDefinition<C>
