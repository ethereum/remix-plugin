
export abstract class RemixModule<T extends ModuleProfile = any>  {

  public type: string
  public methods: [keyof T['methods']]
  public notifications: {type: string, key: string}[]
  public abstract activate: () => void

  constructor(json: Profile<T>) {
    this.type = json.type
    this.methods = json.methods
    this.notifications = json.notifications
  }

  protected checkMethod(message: Message) {
    if (!this.methods.includes(message.key)) {
      throw new Error(`Method ${message.key} is not defined in the module interface`)
    }
  }

  abstract call(message: Message): Promise<any>

}

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
  methods: {
    [key: string]: (params: any) => any
  }
  events: {
    [key: string]: any
  }
  notifications: {type: string, key: string}[],
}

export interface Profile<T extends ModuleProfile> {
  displayName: T['displayName'],
  icon: T['icon'],
  type: T['type'],
  methods: [keyof T['methods']],
  events: [keyof T['events']],
  notifications: T['notifications']
}

