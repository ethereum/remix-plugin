import { AppManager } from '../src'

import { CompilerProfile, CompilerApi, Compiler } from '../examples/modules'

interface IAppManager {
  modules: {
    solCompiler: Compiler
  }
  plugins: {}
}


describe('Module', () => {
  let app: AppManager<IAppManager>
  let api: CompilerApi
  beforeAll(() => {
    api = new CompilerApi()
    app = new AppManager({
      modules: [{ json: CompilerProfile, api }]
    })
  })
  test('is added to app', () => expect(app.calls[api.type]).toBeDefined())
  test('method is added to app', () => {
    const lastCompilationResult = app.calls[api.type].lastCompilationResult()
    expect(lastCompilationResult).toEqual('compilation')
  })
})


