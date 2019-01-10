import { ModuleProfile, Api, API, ApiEventEmitter } from '../../src'
import { EventEmitter} from 'events'

/*
// Type
export interface PluginManager extends Api {
  name: 'pluginManager'
  events: {
    activate: string,
    deactivate: string
  }
}

// Profile
export const PluginManagerProfile: ModuleProfile<PluginManager> = {
  name: 'pluginManager',
  events: ['activate', 'deactivate']
}

// API
export class PluginManagerApi implements API<PluginManager> {
  public readonly name = 'pluginManager'
  public events: ApiEventEmitter<PluginManager> = new EventEmitter()
}
*/