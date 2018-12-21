import { ModuleProfile, EventEmitter, Api, API } from '../../src'


// Type
export interface PluginManager extends Api {
  type: 'pluginManager'
  activate: EventEmitter<string>
  deactivate: EventEmitter<string>
}

// Profile
export const PluginManagerProfile: ModuleProfile<PluginManager> = {
  type: 'pluginManager',
  methods: [],
  events: ['activate', 'deactivate']
}

// API
export class PluginManagerApi extends API<PluginManager> implements PluginManager {
  constructor() {
    super('pluginManager')
  }

  public activate = new EventEmitter<string>('activate')
  public deactivate = new EventEmitter<string>('deactivate')

}