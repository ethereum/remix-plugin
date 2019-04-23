import { BaseApi, Api, ModuleProfile, PluginApi } from 'remix-plugin'

// API Interface
interface PluginManagerApi extends Api {
  name: 'pluginManager'
  events: {
    added: (plugin: PluginApi<Api>) => void
    activated: (name: string) => void
    deactivated: (name: string) => void
  }
  methods: {}
}

// PROFILE
const profile: ModuleProfile<PluginManagerApi> = {
  name: 'pluginManager',
  displayName: 'Plugin Manager',
  description: 'The plugin manager helps for activating or deactivating plugins',
}

// MODULE
export class PluginManager extends BaseApi<PluginManagerApi> {
  private plugins: { [name: string]: PluginApi<Api> } = {}
  private actives: string[] = []

  constructor() {
    super(profile)
  }

  /**
   * Get one plugin if registered
   * @param name The name of the plugin to get
   */
  public getOne<T extends Api>(name: string): PluginApi<T> {
    if (!this.plugins[name]) throw new Error(`${name} plugin is not register yet`)
    return this.plugins[name] as PluginApi<T>
  }

  /**
   * Register a plugin
   * @param plugin The Api of the plugin
   */
  public addOne<T extends Api>(plugin: PluginApi<T>): void {
    if (this.plugins[plugin.name]) throw new Error(`${plugin.name} already exists`)
    this.plugins[plugin.name] = plugin
    this.events.emit('added', plugin)
  }

  /**
   * Activate or deactivate a plugin if is registered
   * @param name The name of the plugin to activate
   * @param isActive if true -> activate, if false -> deactivate
   */
  public setActive(name: string, isActive: boolean): void {
    const index = this.actives.indexOf(name)
    if (isActive && index === -1) {
      this.actives.push(name)
      this.events.emit('activated', name)
    }
    if (!isActive && index !== -1) {
      this.actives.splice(index, 1)
      this.events.emit('deactivated', name)
    }
  }

  public getAll() {
    return Object.keys(this.plugins).map(key => this.plugins[key])
  }

  public isActive(name: string) {
    return this.actives.includes(name)
  }
}

export const pluginManager = new PluginManager()