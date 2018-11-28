import { ModuleManager, PluginManager } from 'remix-plugin'
import { HelloWorldPlugin, Es6HelloWorldPlugin } from 'examples'

let moduleManager: ModuleManager
let pluginManager: PluginManager


beforeEach(() => {
  moduleManager = new ModuleManager()
  pluginManager = new PluginManager(moduleManager)
})

test('Create module manager', () => expect(moduleManager).toBeDefined())
test('Create plugin manager', () => expect(pluginManager).toBeDefined())

describe('Test Hello World Plugin', () => {
  let helloWorld: Es6HelloWorldPlugin

  beforeEach(() => {
    helloWorld = new Es6HelloWorldPlugin()
  })

  test('Register', () => {
    pluginManager.register(helloWorld)
    expect(pluginManager['plugins'][helloWorld.type]).toBeDefined()
  })

  test('Activate', () => {
    const spy = jest.spyOn(helloWorld, 'activate')
    pluginManager.register(helloWorld)
    pluginManager.activate(helloWorld.type)
    expect(spy).toHaveBeenCalled()
  })

  test('Add Log Method', () => {
    const spy = jest.spyOn(moduleManager, 'addMethod')
    pluginManager.register(helloWorld)
    pluginManager.activate(helloWorld.type)
    expect(spy).toHaveBeenCalled()
  })
})
