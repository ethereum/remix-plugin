import { CompilerProfile, compilerProfile, CompilerService } from './../src/api/compiler.api'
import { AppManager, ProfileConfig } from './../src/index'

test('Create module manager', () => expect(AppManager.create()).toBeDefined())

// MOCKS
// Compiler
class Compiler implements CompilerService  {
  event = {
    registered: {},
    unregister(e: 'compilationFinished') {
      delete this.register[e]
    },
    register(e: 'compilationFinished', cb: (value: {success: boolean, data: any, source: any}) => any) {
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
  let service: Compiler

  beforeEach(() => {
    service = new Compiler()
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

  test('Compiler broadcast event', async () => {
    const spy = jest.spyOn(manager, 'broadcast')
    const compiler = manager.modules.compiler
    compiler.activate()
    const value = {success: true, data: [], source: []}
    service.event.trigger('compilationFinished', value)
    expect(spy).toBeCalledWith({type: compiler.type, key: 'compilationFinished', value})
  })
})
