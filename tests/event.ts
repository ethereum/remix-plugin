import { Plugin, AppManager, PluginProfile } from '../src'
import { TxlistenerApi, TxlistenerProfile, TxEmitter, Txlistener } from '../examples/modules'
import { Ethdoc } from '../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  events: ['createDoc'],
  notifications: [{type: 'txlistener', key : 'newTransaction'}],
  url: ''
}


export interface IAppManager {
  modules: {
    txlistener: Txlistener
  }
  plugins: {
    ethdoc: Ethdoc
  }
}

describe('Event', () => {
  let app: AppManager<IAppManager>
  let module: TxlistenerApi
  let plugin: Plugin<Ethdoc>
  let txemitter: TxEmitter
  beforeAll(() => {
    txemitter = new TxEmitter()
    module = new TxlistenerApi(txemitter)
    plugin = new Plugin(EthdocProfile)
    app = new AppManager({
      modules: [{ json: TxlistenerProfile, api: module }],
      plugins: [{ json: EthdocProfile, api: plugin }]
    })
    app.activate(EthdocProfile.type)
  })
  test('event from module is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith(module.type, 'newTransaction', {data: '0x'})
  })

  test('event from module is received by plugin', () => {
    const spy = spyOn(plugin, 'postMessage' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith({type: module.type, key: 'newTransaction', value: {data: '0x'}})
  })

  test('event from plugin is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    if (!EthdocProfile.events) throw new Error('EthdocProfile should have "events"')
    plugin.events.emit(EthdocProfile.events[0], true)
    expect(spy).toBeCalledWith(plugin.type, EthdocProfile.events[0], true)
  })
})
