import { IdeManager } from './app-manager'

// Modules = Internal Plugins
import { FileManager, PluginManager } from './modules'

// Instanciate Modules
const fileManager = new FileManager()
const pluginManager = new PluginManager()
const app = new IdeManager(pluginManager)

// Initialize all plugins that are required
app.init([
  pluginManager.api(),
  fileManager.api(),
])