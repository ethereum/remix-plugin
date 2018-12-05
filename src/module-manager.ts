import { Message, RemixModule, ModuleProfile, Profile } from './remix-module'
import { InternalModule } from './internal.module'
import { IframeModule, IframeProfile, ExternalProfile } from './iframe.module'





export interface InternalModuleConfig<T extends ModuleProfile = any> {
  [type: string]: T
}
export interface ExternalModuleConfig<T extends IframeProfile = any> {
  [type: string]: T
}

export interface ManagerConfig {
  internals: InternalModuleConfig
  externals: ExternalModuleConfig
}

/* Config */
export type InternalConfig<C extends ManagerConfig> = {
  [key in keyof C['internals']]: Profile<C['internals'][key]>
}
export type ExternalConfig<C extends ManagerConfig> = {
  [key in keyof C['externals']]: ExternalProfile<C['externals'][key]>
}
export interface ProfileConfig<C extends ManagerConfig> {
  internals?: InternalConfig<C>
  externals?: ExternalConfig<C>
}

/* Methods */
export type InternalMethods<C extends ManagerConfig> = {
  [key in keyof C['internals']]: C['internals'][key]['methods']
}
export type ExternalMethods<C extends ManagerConfig> = {
  [key in keyof C['externals']]: C['externals'][key]['methods']
}
export type ManagerMethods<C extends ManagerConfig> = InternalMethods<C> & ExternalMethods<C>


/* Module Instances */
export type InternalDefinition<C extends ManagerConfig> = {
  [key in keyof C['internals']]: InternalModule<C['internals'][key]>
}
export type ExternalDefinition<C extends ManagerConfig> = {
  [key in keyof C['externals']]: IframeModule<C['externals'][key]>
}
export type ManagerDefinition<C extends ManagerConfig> = InternalDefinition<C> & ExternalDefinition<C>


export class ModuleManager<C extends ManagerConfig = any> {

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
  static create<Config extends ManagerConfig>(config: ProfileConfig<Config>) {
    const manager = new ModuleManager<Config>()
    manager.modules = {} as any
    manager.calls = {} as any
    if (config.internals) {
      for (const type in config.internals) {
        const module = new InternalModule(config.internals[type], manager) as any
        manager.modules[type] = module
        manager.calls[type] = module.calls
      }
    }
    if (config.externals) {
      for (const type in config.externals) {
        const module = new IframeModule(config.externals[type], manager) as any
        manager.modules[type] = module
        manager.calls[type] = module.calls
      }
    }

    return manager
  }

  /** Add a module to the module manager */
  public addModule(module: RemixModule) {
    this.modules[module.type] = module as any
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
  public broadcast({ type, key, value }: Message) {
    Object.keys(this.events).forEach(origin => {
      const module = this.events[origin][type]
      if (!!module && !!module[key]) {
        this.events[origin][type][key](value)
      }
    })
  }
}
