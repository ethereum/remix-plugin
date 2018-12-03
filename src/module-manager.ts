import { Message, RemixModule, ModuleApi, ModuleProfile } from './remix-module'
import { InternalModule } from './internal.module'
import { IframeModule, IframeProfile } from './iframe.module'

export interface ManagerConfiguration {
  internals?: {module: ModuleProfile, api: ModuleApi<any>}[],
  externals?: IframeProfile[]
}

export class ModuleManager {

  public modules: {
    [type: string]: RemixModule
  } = {}

  public events: {
    [origin: string]: {
      [type: string]: {
        [key: string]: (value: any) => any
      }
    }
  } = {}

  /**
   * Create a Module Manager and instanciate all the modules
   * @param config List of module profile
   */
  static create(config: ManagerConfiguration = { internals: [], externals: []}) {
    const manager = new ModuleManager()
    if (config.internals) {
      config.internals.forEach(({module, api}) => {
        manager.addModule(new InternalModule(module, manager, api))
      })
    }
    if (config.externals) {
      config.externals.forEach((module) => {
        manager.addModule(new IframeModule(module, manager))
      })
    }

    return manager
  }

  /** Add a module to the module manager */
  public addModule(module: RemixModule) {
    this.modules[module.type] = module
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
