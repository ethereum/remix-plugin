
export abstract class RemixModule {

  public type: string
  public methods: string[]

  constructor(json: ModuleProfile) {
    this.type = json.type
    this.methods = json.methods
  }

  protected checkMethod(message: Message) {
    if (!this.methods.includes(message.key)) {
      throw new Error(`Method ${message.key} is not defined in the module interface`)
    }
  }

  abstract call(message: Message): Promise<any>

}

export type ModuleApiMethods<T extends ModuleProfile> = {
  [P in keyof T['methods']]: (...params: any[]) => any
}

export type ModuleApiEvents<T extends ModuleProfile> = {
  [P in keyof T['notifications']]: (...params: any[]) => any
}

export type ModuleApi<T extends ModuleProfile> = ModuleApiMethods<T> & ModuleApiEvents<T>

export interface Message {
  id: number,
  action: 'notification' | 'request' | 'response',
  type: string,
  key: string,
  value: any,
  error?: Error
}

export interface ModuleProfile {
  displayName: string,
  icon: string,
  type: string,
  methods: string[]
  notifications: {type: string, key: string}[],
}