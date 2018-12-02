import { RemixModule, ModuleProfile, Message, ModuleApi } from "./remix-module"
import { ModuleManager } from "./module-manager"

export class InternalModule<T extends ModuleProfile> extends RemixModule {

  constructor(
    json: T,
    private manager: ModuleManager,
    private api: ModuleApi<T>
  ) {
    super(json)

    json.notifications.forEach(({type, key}) => {
      this.manager.addEvent(this.type, type, key, (value) => this.api[key](value))
    })
  }

  public async call(message: Message) {
    this.checkMethod(message)
    const key = message.key
    if (!this.api[key]) {
      throw new Error(`Method ${key} doesn't exist in module ${this.type}`)
    }
    const value = await this.api[key](message.value)
    return {...message, value}
  }

}