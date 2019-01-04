import { PluginManagerApi } from './plugin-manager'
import {
  PluginProfile,
  ModuleProfile,
  API,
  EventListeners,
  Api
} from '../types'
import { Plugin } from './plugin'

export class AppManager {

  private events: EventListeners = {}
  private calls: {
    [type: string]: {
      [key: string]: Function
    }
  }

  public init(pluginManager: PluginManagerApi) {
    pluginManager.event.on('activate', ({profile, api}) => {
      this.activateCallAndEvent(profile, api)
      if (profile['url']) {
        this.activateRequestAndNotification(profile as PluginProfile, api as Plugin<any>)
      }
    })
    pluginManager.event.on('deactivate', (profile) => this.deactivate(profile as PluginProfile))
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

  private activateCallAndEvent(profile: ModuleProfile, api: API<any>) {
    const events = profile.events || []
    events.forEach(event => {
      if (!api.events) return
      api.events.on(event, (value: any) => this.broadcast(api.type, event as string, value))
    })

    const methods = profile.methods || []
    methods.forEach((key) => {
      if (key in api) {
        this.calls[api.type][key] = (...args: any[]) => (api[key] as any)(...args)
      }
    })
  }

  /** Activate Plugin */
  private activateRequestAndNotification(json: PluginProfile, api: Plugin<any>) {
    api.request = ({ type, key, value }) => this.calls[type][key](value)

    const notifications = json.notifications || []
    notifications.forEach(({ type, key }) => {
      const origin = api.type
      if (!this.events[origin]) this.events[origin] = {}
      if (!this.events[origin][type]) this.events[origin][type] = {}
      this.events[origin][type][key] = api.notifs[type][key]
    })
  }

  private deactivate(profile: PluginProfile) {
    this.calls[profile.type] = {} as any

    const methods = profile.methods || []
    methods.forEach(key => delete this[profile.type][key])
  }


}