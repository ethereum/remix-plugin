import { RemixPlugin } from './plugins'
import { AppManager } from './module-manager'

export interface PluginMap {
  [type: string]: RemixPlugin
}

/**
 * The plugin Manager registers the plugins and activates them lazily
 */
export class PluginManager {
  private plugins: PluginMap = {}

  constructor(private AppManager: AppManager) {}

  /** Register a plugin */
  public register(plugin: RemixPlugin) {
    if (this.plugins[plugin.type]) {
      throw new Error(`Plugin "${plugin.type}" is already registered`)
    }
    this.plugins[plugin.type] = plugin
  }

  /** Activate lazily a plugin */
  public activate(type: string) {
    if (!this.plugins[type]) {
      throw new Error(`Plugin "${type}" isn't registered`)
    }
    this.plugins[type].activate(this.AppManager)
  }
}
