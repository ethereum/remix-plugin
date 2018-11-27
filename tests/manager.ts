import { ModuleManager, PluginManager } from 'remix-plugin'
import { HelloWorldPlugin } from 'examples'

let moduleManager: ModuleManager
let pluginManager: PluginManager

beforeEach(() => {
  moduleManager = new ModuleManager()
  pluginManager = new PluginManager(moduleManager)
})

test('Create module manager', () => expect(moduleManager).toBeDefined())
test('Create plugin manager', () => expect(pluginManager).toBeDefined())

test('Register the AppApi', () => {
  const helloWorld = new HelloWorldPlugin()
  pluginManager.register(helloWorld)
  expect(pluginManager['plugins'][helloWorld.type]).toBeDefined()
})