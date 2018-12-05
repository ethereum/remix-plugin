import { Profile } from './../src/remix-module'
import { CompilerProfile, compilerProfile, CompilerService } from './../src/api/compiler.api'
import { ModuleManager, InternalModule, ModuleProfile, ProfileConfig } from './../src/index'

test('Create module manager', () => expect(ModuleManager.create({})).toBeDefined())

export interface OtherProfile extends ModuleProfile {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: {
    toto(): string
  },
  notifications: []
}
export const otherProfile: Profile<OtherProfile> = {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: ['toto'],
  notifications: []
}

// MOCKS
// Compiler
class Compiler implements CompilerService  {
  lastCompilationResult: 'last'
  event = {
    _listener: {},
    register(e: 'compilationFinished', cb: (params: {success: boolean, data: any, source: any}) => void) {
      this._listener[e] = cb
    },
    trigger(e: 'compilationFinished', params: {success: boolean, data: any, source: any}) {
      this._listener[e](params)
    }
  }
}

interface Manager {
  internals: {
    compiler: CompilerProfile,
  },
  externals: {}
}

describe('Compiler', () => {
  let manager: ModuleManager<Manager>

  beforeEach(() => {
    const config: ProfileConfig<Manager> = {
      internals: { compiler: compilerProfile }
    }
    manager = ModuleManager.create(config)
  })

  test('Module Manager has Compiler', () => {
    expect(manager.modules.compiler).toBeDefined()
  })

  test('Compiler is activated', async () => {
    const service = new Compiler()
    const compiler = manager.modules.compiler
    compiler.activate(service)
    expect(compiler.calls.lastCompilationResult).toBeDefined()
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
    const spy = jest.spyOn(moduleManager, 'addMethod')
    pluginManager.register(helloWorld)
    pluginManager.activate(helloWorld.type)
    expect(spy).toHaveBeenCalled()
  })
})
*/