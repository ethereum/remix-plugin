import { ModuleManager, PluginManager } from 'remix-plugin'

let moduleManager: ModuleManager
let pluginManager: PluginManager

beforeEach(() => {
  moduleManager = new ModuleManager()
  pluginManager = new PluginManager(moduleManager)
})

test('Create module manager', () => expect(moduleManager).toBeDefined())
test('Create plugin manager', () => expect(pluginManager).toBeDefined())