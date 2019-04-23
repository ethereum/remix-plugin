import('./components')
import { IdeManager } from './app-manager'

// Modules = Internal Plugins
import { FileManager, pluginManager } from './modules'

/////////////
// MODULES //
/////////////
const fileManager = new FileManager()
const app = new IdeManager(pluginManager)

// Initialize all plugins that are required
app.init([
  pluginManager.api(),
  fileManager.api(),
])

/////////////
// PLUGINS //
/////////////
import { Plugin } from 'remix-plugin'
import { ethdocProfile } from '../../plugins/ethdoc/profile'
const ethdoc = new Plugin(ethdocProfile)

// Add plugins
app.registerMany([
  ethdoc.api()
])