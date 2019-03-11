import {
  RemixAppManager,
  Store,
  CompilerApi,
} from '../examples/modules'

describe('Module', () => {
  let app: RemixAppManager
  let compiler: CompilerApi
  beforeEach(() => {
    compiler = new CompilerApi()
    app = new RemixAppManager(new Store())
    app.init([compiler.api()])
  })
  test('is added to app', () => {
    expect(app['calls'][compiler.name]).toBeDefined()
  })
  test('method is added to app', () => {
    expect(app['calls'][compiler.name]['lastCompilationResult']).toBeDefined()
  })
  test('deactivate module', () => {
    app.deactivateOne(compiler.name)
    expect(app['calls'][compiler.name]).toBeUndefined()
  })
})
