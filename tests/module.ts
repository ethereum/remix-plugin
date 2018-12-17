import { AppManager } from '../src'

import { CompilerProfile, CompilerApi } from '../examples/modules'

/* ---- TEST ---- */


describe('Module', () => {
  let app: AppManager
  let api: CompilerApi
  beforeAll(() => {
    api = new CompilerApi()
    app = new AppManager({
      modules: [{ json: CompilerProfile, api }]
    })
  })
  test('is added to app', () => expect(app[api.type]).toBeDefined())
  test('method is added to app', () => {
    const lastCompilationResult = app[api.type].lastCompilationResult()
    expect(lastCompilationResult).toEqual('compilation')
  })
})


