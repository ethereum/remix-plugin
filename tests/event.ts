import { Plugin, AppManager } from '../src'
import { TxlistenerApi, TxlistenerProfile, TxEmitter } from '../examples/modules'

const EthdocProfile = {
  type: 'ethdoc',
  methods: ['getDoc'],
  notifications: [{type: 'txlistener', key : 'newTransaction'}],
  url: ''
}

describe('Event', () => {
  let app: AppManager
  let module: TxlistenerApi
  let plugin: Plugin
  let txemitter: TxEmitter
  beforeAll(() => {
    txemitter = new TxEmitter()
    module = new TxlistenerApi(txemitter)
    plugin = new Plugin(EthdocProfile)
    app = new AppManager({
      modules: [{ json: TxlistenerProfile, api: module }],
      plugins: [{ json: EthdocProfile, api: plugin }]
    })
  })
  test('event is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith(module.type, 'newTransaction', {data: '0x'})
  })

  test('event is received', () => {
    const spy = spyOn(plugin, 'postMessage' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith({type: module.type, key: 'newTransaction', value: {data: '0x'}})
  })


})
