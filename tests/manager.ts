import { ModuleManager } from 'remix-plugin'
import { HelloWorldPlugin, Es6HelloWorldPlugin } from 'examples'

test('Create module manager', () => expect(ModuleManager.create()).toBeDefined())

let moduleManager: ModuleManager
beforeEach(() => {
  moduleManager = ModuleManager.create()
})



/*
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
*/