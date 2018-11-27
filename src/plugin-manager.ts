import { RemixPlugin } from './plugins/remix-plugin'
import { ModuleManager } from './module-manager'

export interface PluginMap {
  [type: string]: RemixPlugin
}

/**
 * The plugin Manager registers the plugins and activates them lazily
 */
export class PluginManager {
  private plugins: PluginMap = {}

  constructor(private moduleManager: ModuleManager) {}

  /** Register a plugin */
  public register(plugin: RemixPlugin) {
    if (this.plugins[plugin.type]) {
      throw new Error('Plugin already registered')
    }
    this.plugins[plugin.type] = plugin
  }

  /** Activate lazily a plugin */
  public activate(type: string) {
    if (this.plugins[type]) {
      throw new Error('Plugin already registered')
    }
    this.plugins[type].activate(this.moduleManager)
  }
}
