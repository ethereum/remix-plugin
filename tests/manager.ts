import { Profile } from './../src/remix-module'
import { CompilerProfile, compilerProfile, CompilerService } from './../src/api/compiler.api'
import { AppManager, Module, ModuleProfile, ProfileConfig } from './../src/index'

test('Create module manager', () => expect(AppManager.create()).toBeDefined())

// MOCKS
// Compiler
class Compiler implements CompilerService  {
  event = {
    registered: {},
    unregister(e: 'compilationFinished') {
      delete this.register[e]
    },
    register(e: 'compilationFinished', cb: (params: {success: boolean, data: any, source: any}) => void) {
      this.registered[e] = cb
    },
    trigger(e: 'compilationFinished', params: {success: boolean, data: any, source: any}) {
      this.registered[e](params)
    }
  }
  lastCompilationResult() { return 'last' }
}

interface Manager {
  modules: {
    compiler: CompilerProfile,
  },
  plugins: {},
  providers: {}
}

describe('Compiler', () => {
  let manager: AppManager<Manager>

  beforeEach(() => {
    const service = new Compiler()
    const config: ProfileConfig<Manager> = {
      providers: { compiler: service },
      modules: { compiler: compilerProfile }
    }
    manager = AppManager.create(config)
  })

  test('Module Manager has Compiler', () => {
    expect(manager.modules.compiler).toBeDefined()
  })

  test('Compiler is activated', async () => {
    const compiler = manager.modules.compiler
    compiler.activate()
    expect(compiler.calls.lastCompilationResult()).toEqual('last')
  })
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
    const spy = jest.spyOn(AppManager, 'addMethod')
    pluginManager.register(helloWorld)
    pluginManager.activate(helloWorld.type)
    expect(spy).toHaveBeenCalled()
  })
})
*/