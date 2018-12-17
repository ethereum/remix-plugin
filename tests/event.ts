import { Plugin, AppManager } from '../src'
import { TxlistenerApi, TxlistenerProfile, TxEmitter } from '../examples/modules'
import { EthdocProfile } from '../examples/plugins'

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

  /*
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
  */
})
