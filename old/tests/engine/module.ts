import {
  RemixAppManager,
  Store,
  CompilerModule,
} from '../../examples/modules'

const AUTHORIZED = 'authorizedPlugin'
const UNAUTHORIZED = 'unauthorizedPlugin'

describe('Module', () => {
  let app: RemixAppManager
  let compiler: CompilerModule
  beforeEach(() => {
    compiler = new CompilerModule([AUTHORIZED])
    app = new RemixAppManager(new Store())
    app.init([compiler.api()])
  })
  test('is added to app', () => {
    expect(app['calls'][compiler.name]).toBeDefined()
  })
  test('method is added to app', () => {
    expect(app['calls'][compiler.name]['getCompilationResult']).toBeDefined()
  })
  test('deactivate module', () => {
    app.deactivateOne(compiler.name)
    expect(app['calls'][compiler.name]).toBeUndefined()
  })

  test('can call a method', async () => {
    const result = await app['calls'][compiler.name].getCompilationResult({from: AUTHORIZED})
    expect(result).toBe('compilation')
  })
  test('get current request', async () => {
    const requestInfo = {from: AUTHORIZED}
    app['calls'][compiler.name].getCompilationResult(requestInfo)
    expect(compiler['currentRequest']).toBe(requestInfo)  // Don't wait for request to finish
  })
  test('current request should be cleared after request', async () => {
    const requestInfo = {from: AUTHORIZED}
    app['calls'][compiler.name]
      .getCompilationResult(requestInfo)
      .then(_ => expect(compiler['currentRequest']).toBe(undefined))
  })
  test('get current request', async () => {
    const requestInfo = {from: AUTHORIZED}
    app['calls'][compiler.name].getCompilationResult(requestInfo)
    expect(compiler['currentRequest']).toBe(requestInfo)
  })
  test('handle error in calls', async () => {
    try {
      const requestInfo = {from: UNAUTHORIZED}
      await app['calls'][compiler.name].getCompilationResult(requestInfo)
    } catch (err) {
      expect(err.message).toMatch(/not allowed/)
    }
  })
  test('calls are handled in queue', async () => {
    app['calls'][compiler.name]
      .getCompilationResult({from: AUTHORIZED})
      .then(result => expect(result).toBe('compilation'))
    app['calls'][compiler.name]
      .getCompilationResult({from: UNAUTHORIZED})
      .catch(err => expect(err.message).toMatch(/not allowed/))
    app['calls'][compiler.name]
      .getCompilationResult({from: AUTHORIZED})
      .then(result => expect(result).toBe('compilation'))
  })
})
