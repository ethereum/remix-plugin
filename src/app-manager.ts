import {
  PluginProfile,
  ModuleProfile,
  API,
  IAppManager,
  ModuleStore,
  EventListeners,
  AppCalls,
  Api,
  ModuleList
} from './types'
import { Plugin, PluginList, PluginStore } from './plugin'



export class AppManager<T extends IAppManager> {
  private modules: ModuleStore<T['modules']>
  private plugins: PluginStore<T['plugins']>
  public events: EventListeners = {}
  public calls: AppCalls<T>

  constructor(dependencies: {
    modules?: ModuleList<T['modules']>
    plugins?: PluginList<T['plugins']>
    options?: {
      boostrap: string
    }
  }) {
    // Modules
    const modules = dependencies.modules || []
    this.modules = modules.reduce((acc, { json, api }) => {
      this.calls[api.type] = {} as any
      this.activateApi(json, api) // Activate module automaticaly
      return { ...acc, [json.type]: { json, api } }
    }, {} as ModuleStore<T['modules']>)

    // Plugins
    const plugins = dependencies.plugins || []
    this.plugins = plugins.reduce((acc, { json, api }) => {
      this.calls[api.type] = {}
      return { ...acc, [json.type]: { json, api } }
    }, {} as PluginStore<T['plugins']>)

    // bootstrap
    if (dependencies.options && dependencies.options.boostrap) {
      const { api } = this.modules[dependencies.options.boostrap]
      if (!api.events) return
      api.events.on('activate', (type: string) => this.activate(type))
      api.events.on('deactivate', (type: string) => this.deactivate(type))
    }
  }

  /** Broadcast a message to every plugin listening */
  private broadcast<M extends Api, E extends keyof M['events']>(
    type: M['type'],
    key: E,
    value: M['events'][E]
  ) {
    for (const origin in this.events) {
      if (this.events[origin][type]) {
        const destination = this.events[origin][type]
        if (destination[key]) destination[key](value)
      }
    }
  }

  /**************************/
  /* ----- ACTIVATION ----- */
  /**************************/

  /** Add an api to the AppModule */
  private activateApi<M extends Api>(json: ModuleProfile<M>, api: API<M>) {
    const events = json.events || []
    events.forEach(event => {
      if (!api.events) return
      api.events.on(event, (value: any) => this.broadcast(api.type, event, value))
    })

    const methods = json.methods || []
    methods.forEach(key => {
      if (key in api) this.calls[api.type as string][key] = api[key]
    })
  }

  /** Activate Plugin */
  private activatePlugin<M extends Api>(json: PluginProfile<M>, api: Plugin) {
    api.request = ({ type, key, value }) => this[type][key](value)

    const notifications = json.notifications || []
    notifications.forEach(({ type, key }) => {
      const origin = api.type
      if (!this.events[origin]) this.events[origin] = {}
      if (!this.events[origin][type]) this.events[origin][type] = {}
      this.events[origin][type][key] = api.notifs[type][key]
    })
  }

  /** Activate a plugin or module */
  public activate<M extends Api>(type: M['type']) {
    if (!this.plugins[type] && !this.modules[type]) {
      throw new Error(`Module or Plugin ${type} is not registered yet`)
    }
    // If type is registered as a plugin
    if (this.plugins[type]) {
      const { json, api } = this.plugins[type]
      this.activateApi<M>(json as any, api as any)
      this.activatePlugin<M>(json as any, api)
      api.activate()
    }
    // If type is registered as a module
    if (this.modules[type]) {
      const { json, api } = this.modules[type]
      this.activateApi<M>(json as any, api as any)
      api.activate()
    }
  }

  /****************************/
  /* ----- DEACTIVATION ----- */
  /****************************/

  /** Deactivate a module's api from the AppModule */
  private deactivateApi<M extends Api>(json: ModuleProfile<M>, api: API<M>) {
    this.calls[api.type] = {} as any

    const events = json.events || []
    events.forEach(event => {
      // TODO : EventManager
      // if (event in api) api[event].unregister()
    })

    const methods = json.methods || []
    methods.forEach(key => {
      if (key in api) delete this[api.type as string][key]
    })
  }

  /** Deactivate Plugin */
  private deactivatePlugin<M extends Api>(json: PluginProfile<M>, api: Plugin) {
    delete api.request

    const notifications = json.notifications || []
    notifications.forEach(({ type, key }) => {
      if (!this.events[api.type]) this.events[api.type] = {}
      if (!this.events[api.type][type]) this.events[api.type][type] = {}
      delete this.events[api.type][type][key]
    })
  }

  /** Deactivate a plugin or module */
  public deactivate<M extends Api>(type: M['type']) {
    if (!this.plugins[type] && !this.modules[type]) {
      throw new Error(`Module or Plugin ${type} is not registered yet`)
    }
    if (this.plugins[type]) {
      const { json, api } = this.plugins[type]
      this.deactivateApi<M>(json as any, api as any)
      this.deactivatePlugin<M>(json as any, api)
      api.deactivate()
    }
    if (this.modules[type]) {
      const { json, api } = this.modules[type]
      this.deactivateApi<M>(json as any, api as any)
      api.deactivate()
    }
  }
}
