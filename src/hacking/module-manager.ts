import { Message, RemixModule } from './remix-module'

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
