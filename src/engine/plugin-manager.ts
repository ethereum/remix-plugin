import { ApiEventEmitter } from './../types'
import { EventEmitter } from 'events'
import {
  ModuleProfile,
  API,
  Api,
} from '../types'

interface PluginManager extends Api {
  type: 'pluginManager',
  events: {
    register: string
    activate: {profile: ModuleProfile<any>, api: API<any>},
    deactivate: ModuleProfile
  }
  activate(type: string): void,
  deactivate(type: string): void
}

export class PluginManagerApi {

  /** Map module types with your implementation of this map */
  protected mapNames: { [type: string]: string }

  public event: ApiEventEmitter<PluginManager> = new EventEmitter()

  constructor(private component: PluginManagerComponent) {
    component.event.on('activate', type => this.activate(type))
  }

  /** Add modules and plugins and activate them */
  public init(entries: ModuleEntry[]) {
    entries.forEach(entry => {
      this.component.add(entry)
      this.activate(entry.profile.type)
      this.event.emit('register', entry.profile.type)
    })
  }

  /** Safe method to get the type of a module in a specific implementation */
  private getType(type: string): string {
    return this.mapNames[type] || type
  }

  /** Add plugins */
  addPlugins() {

  }

  /** Add Modules */
  addModules(entries: ModuleEntry[]) {
    entries.forEach(entry => {
      this.component.add(entry)
      this.event.emit('register', entry.profile.type)
    })
  }

  /** Activate a module or plugin */
  activate(type: string) {
    const id = this.getType(type)
    const { profile, api } = this.component.getModule(id)
    this.event.emit('activate', { profile, api })
    if (api.activate) api.activate()
  }

  /** Deactivate a module or plugin */
  deactivate(type: string) {
    const id = this.getType(type)
    const { profile, api } = this.component.getModule(id)
    this.event.emit('deactivate', profile)
    // if (api.events) api.events.removeAllListeners()
    if (api.deactivate) api.deactivate()
  }
}

interface ModuleEntry {
  profile: ModuleProfile
  api: API<any>
}

interface PluginManagerComponent {
  state: PluginManagerState
  event: EventEmitter

  getModule(type: string): ModuleEntry
  add(entry: ModuleEntry): void
}


interface PluginManagerState {
  types: string[]
  entities: {
    [type: string]: {
      activated: boolean,
      api: API<any>
    }
  }
}