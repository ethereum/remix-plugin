import { ApiFactory, Api, ModuleProfile, PluginApi } from 'remix-plugin'

// API Interface
interface PluginManagerApi extends Api {
  name: 'pluginManager'
  events: {}
  methods: {}
}

// PROFILE
const pluginProfile: ModuleProfile<PluginManagerApi> = {
  name: 'pluginManager',
  displayName: 'Plugin Manager',
  description: 'The plugin manager helps for activating or deactivating plugins',
}

// MODULE
export class PluginManager extends ApiFactory<PluginManagerApi> {
  private plugins: { [name: string]: PluginApi<Api> } = {}
  private actives: string[] = []
  public readonly profile = pluginProfile

  /**
   * Get one plugin if registered
   * @param name The name of the plugin to get
   */
  public getOne<T extends Api>(name: string): PluginApi<T> {
    if (!this.plugins[name]) throw new Error(`${name} plugin is not register yet`)
    return this.plugins[name]
  }

  /**
   * Register a plugin
   * @param plugin The Api of the plugin
   */
  public addOne<T extends Api>(plugin: PluginApi<T>): void {
    if (this.plugins[plugin.name]) throw new Error(`${plugin.name} already exists`)
    this.plugins[plugin.name] = plugin
  }

  /**
   * Activate or deactivate a plugin if is registered
   * @param name The name of the plugin to activate
   * @param isActive if true -> activate, if false -> deactivate
   */
  public setActive(name: string, isActive: boolean): void {
    const index = this.actives.indexOf(name)
    if (isActive && index === -1) this.actives.push(name)
    if (!isActive && index !== -1) this.actives.splice(index, 1)
  }
}


export class PluginManagerComponent {
  constructor(private pluginManager: PluginManager) {}

}