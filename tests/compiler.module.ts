import {
  AppManager,
  ProfileConfig
} from '../src'

import {
  CompilerService,
  CompilerProfile,
  compilerProfile,
} from '../examples/modules'

interface Manager {
  providers: {
    compiler: CompilerService
  },
  modules: {
    compiler: CompilerProfile
  }
  plugins: {}
}

describe('Compiler Module', () => {
  let manager: AppManager<Manager>
  let service: CompilerService

  beforeEach(() => {
    service = new CompilerService()
    const config: ProfileConfig<Manager> = {
      providers: { compiler: service },
      modules: { compiler: compilerProfile },
    }
    manager = AppManager.create(config)
  })

  test('Module Manager has Compiler', () => {
    expect(manager.modules.compiler).toBeDefined()
  })

  test('Compiler is activated', async () => {
    const compiler = manager.modules.compiler
    expect(compiler.calls.lastCompilationResult()).toEqual('last')
  })

  test('Compiler broadcast event', async () => {
    const spy = jest.spyOn(manager, 'broadcast')
    const compiler = manager.modules.compiler
    const value = { success: true, data: [], source: [] }
    service.event.trigger('compilationFinished', value)
    expect(spy).toBeCalledWith({
      type: compiler.type,
      key: 'compilationFinished',
      value,
    })
  })
})
