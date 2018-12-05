import { RemixModule, ModuleProfile, Message, Profile } from "./remix-module"
import { ModuleManager } from "./module-manager"

export class InternalModule<T extends ModuleProfile> extends RemixModule<T> {

  calls: {
    [key in keyof T['methods']]: T['methods'][key]
  }

  constructor(
    json: Profile<T>,
    private manager: ModuleManager
  ) {
    super(json)
  }

  public activate(service) {
    Object.keys(this.methods).forEach(method => {
      this.calls[method] = service[method]
    })
    this.notifications.forEach(({type, key}) => {
      // this.manager.addEvent(this.type, type, key, (value) => service[key](value))
    })
  }

  public async call(message: Message) {
    this.checkMethod(message)
    const key = message.key
    if (!this.calls[key]) {
      throw new Error(`Method ${key} doesn't exist in module ${this.type}`)
    }
    const value = await this.calls[key](message.value)
    return {...message, value}
  }

}