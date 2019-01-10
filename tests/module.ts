import {
  RemixAppManager,
  PluginManagerComponent,
  CompilerProfile,
  CompilerApi,
} from '../examples/modules'

describe('Module', () => {
  let app: RemixAppManager
  let component: PluginManagerComponent
  let api: CompilerApi
  beforeAll(() => {
    api = new CompilerApi()
    component = new PluginManagerComponent()
    app = new RemixAppManager(component)
    app.init([{ profile: CompilerProfile, api }])
  })
  test('is added to app', () => expect(app['calls'][api.name]).toBeDefined())
  test('method is added to app', () => {
    const lastCompilationResult = app['calls'][api.name].lastCompilationResult()
    expect(lastCompilationResult).toEqual('compilation')
  })
})
