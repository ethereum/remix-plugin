import { RemixModule, ModuleProfile, Message, Profile } from './remix-module'
import { AppManager } from './app-manager'

export class Module<T extends ModuleProfile> extends RemixModule<T> {
  public calls: ModuleMethods<T>
  public activate: () => void

  constructor(
    json: Profile<T>,
    private manager: AppManager,
    service: ModuleService<T>,
  ) {
    super(json)

    this.activate = () => {
      this.calls = this.methods.reduce(
        (acc, method) => ({ ...acc, [method]: service[method] }),
        {},
      ) as ModuleMethods<T>
      this.notifications.forEach(({ type, key }) => {
        this.manager.addEvent(this.type, type, key, value =>
          service.event.trigger(key, value),
        )
      })
    }
  }

  public async call(message: Message) {
    this.checkMethod(message)
    const key = message.key
    if (!this.calls[key]) {
      throw new Error(`Method ${key} doesn't exist in module ${this.type}`)
    }
    const value = await this.calls[key](message.value)
    return { ...message, value }
  }
}

/* TYPES */

export type ModuleMethods<T extends ModuleProfile> = {
  [key in keyof T['methods']]: T['methods'][key]
}

export type ServiceMethods<T extends ModuleProfile> = {
  [Key in keyof T['methods']]: T['methods'][Key]
}
export interface ServiceEvents<T extends ModuleProfile> {
  event: {
    registered: {
      [Key in keyof T['events']]: (params: T['events'][Key]) => any
    } | {}
    unregister<E extends keyof T['events']>(eventName: E)
    register<E extends keyof T['events']>(
      eventName: E,
      cb: (params: T['events'][E]) => any,
    )
    trigger<E extends keyof T['events']>(eventName: E, args: T['events'][E])
  }
}

export type ModuleService<T extends ModuleProfile> = ServiceMethods<T> &
  ServiceEvents<T>