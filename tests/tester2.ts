import { API, Api, Profile, Plugin, AppManager, EventEmitter, PluginProfile } from '../src'

/* ---- MOCKS ---- */

/* MODULE */
export interface Compiler extends Api {
  type: 'compiler'
  newTx: EventEmitter<string>
  displayTx(): string
  createTx(tx: string): void
}


export const CompilerProfile: Profile<Compiler> = {
  type: 'compiler',
  methods: ['displayTx', 'createTx'],
  events: ['newTx']
}

export class CompilerApi extends API<Compiler> implements Compiler {
  constructor() {
    super('compiler')
  }

  public newTx = new EventEmitter<string>('newTx')

  public createTx(tx: string) {
    this.newTx.emit(tx)
  }

  public displayTx() {
    return 'hello world'
  }
}

/* PLUGIN */
export const VyCompilerProfile: PluginProfile = {
  type: 'vyCompiler',
  methods: ['compile'],
  events: [],
  notifications: [{type: 'compiler', key : 'newTx'}],
  url: ''
}


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
  test('is added to app', () => expect(app['compiler']).toBeDefined())
  test('method is added to app', () => {
    const displayTx = app['compiler'].displayTx()
    expect(displayTx).toEqual('hello world')
  })
})

describe('Plugin', () => {
  let app: AppManager
  let api: Plugin
  beforeAll(() => {
    api = new Plugin(VyCompilerProfile)
    app = new AppManager({
      plugins: [{ json: VyCompilerProfile, api }]
    })
  })
  test('is added to app', () => expect(app['vyCompiler']).toBeDefined())
  test('method is added to app', () => expect(app['vyCompiler']['compile']).toBeDefined())
})


describe('Interactions', () => {
  let app: AppManager
  let module: CompilerApi
  let plugin: Plugin
  beforeAll(() => {
    module = new CompilerApi()
    plugin = new Plugin(VyCompilerProfile)
    app = new AppManager({
      modules: [{ json: CompilerProfile, api: module }],
      plugins: [{ json: VyCompilerProfile, api: plugin }]
    })
  })
  test('event is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    module.createTx('transaction')
    expect(spy).toBeCalledWith(module.type, 'newTx', 'transaction')
  })

  test('event is received', () => {
    const spy = spyOn(plugin, 'postMessage' as any)
    module.createTx('transaction')
    expect(spy).toBeCalledWith({type: module.type, key: 'newTx', value: 'transaction'})
  })

  test('call a method from plugin api', () => {
    const spy = spyOn(app[module.type], 'displayTx')
    plugin.request({ type: module.type, key: 'displayTx', value: {} })
    expect(spy).toBeCalled()
  })
})
