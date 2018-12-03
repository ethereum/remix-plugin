export interface MethodsMap {
  [type: string]: {
    [key: string]: (value: any, err?: Error) => Promise<any>
  }
}

export interface EventsMap {
  [originType: string]: {
    [type: string]: {
      [key: string]: Function
    }
  }
}

/**
 * Handle connexion between modules
 */
export class ModuleManager {
  private methods: MethodsMap = {}
  private events: EventsMap = {}

  /** Store a request that a plugin exposes */
  public addMethod(type: string, key: string, cb: Function) {
    // TODO : Should we allow rewritting ?
    if (!this.methods[type]) this.methods[type] = {}
    this.methods[type][key] = (value: any, err?: Error) => {
      if (err) return Promise.reject(err)
      return Promise.resolve(cb(value))
    }
  }

  /** Trigger a request exposed by the a plugin */
  public request(type: string, key: string, value: any): Promise<any> {
    if (!this.methods[type]) throw new Error('No module for this request')
    if (!this.methods[type][key]) throw new Error('Request is not registered')
    return this.methods[type][key](value)
  }

  /** A plugin "origin" listen on the notification "key" of the plugin "type" */
  public addEvent(origin: string, type: string, key: string, cb: Function) {
    // TODO : Should we allow rewritting ?
    this.events[origin][type][key] = cb
  }

  /** Trigger a notification and broadcast to all plugins listening */
  public notify(type: string, key: string, value: any) {
    for (const origin in this.events) {
      const plugin = this.events[origin][type]
      if (plugin && plugin[key]) {
        plugin[key](value)
      }
    }
  }
}