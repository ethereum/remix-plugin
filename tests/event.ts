import { Plugin, PluginProfile, Message } from '../src'
import {
  TxlistenerApi,
  TxlistenerProfile,
  TxEmitter,
  RemixAppManager,
  PluginManagerComponent,
} from '../examples/modules'
import { Ethdoc, VyperCompiler } from '../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getDoc'],
  events: ['createDoc'],
  notifications: {
    txlistener: ['newTransaction'],
    vyperCompiler: ['compilationFinished'],
  },
  url: 'some-url',
}

const VyperCompilerProfile: PluginProfile<VyperCompiler> = {
  name: 'vyperCompiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished'],
  url: 'another-url'
}

describe('Event', () => {
  let app: RemixAppManager
  let component: PluginManagerComponent
  let module: TxlistenerApi
  let ethdoc: Plugin<Ethdoc>
  let vyper: Plugin<VyperCompiler>
  let txemitter: TxEmitter
  beforeEach(() => {
    txemitter = new TxEmitter()
    module = new TxlistenerApi(txemitter)
    ethdoc = new Plugin(EthdocProfile)
    vyper = new Plugin(VyperCompilerProfile)
    component = new PluginManagerComponent()
    app = new RemixAppManager(component)
    app.init([
      { profile: TxlistenerProfile, api: module },
      { profile: EthdocProfile, api: ethdoc },
    ])
    app.registerOne({ profile: VyperCompilerProfile, api: vyper })
  })
  test('event from module is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith(module.name, 'newTransaction', { data: '0x' })
  })

  test('event from module is received by ethdoc', () => {
    const spy = spyOn(ethdoc, 'postMessage' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith({
      name: module.name,
      key: 'newTransaction',
      payload: { data: '0x' },
    })
  })

  test('event from ethdoc is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    if (!EthdocProfile.events)
      throw new Error('EthdocProfile should have "events"')
    ethdoc.events.emit(EthdocProfile.events[0], true)
    expect(spy).toBeCalledWith(ethdoc.name, EthdocProfile.events[0], true)
  })

  test('Plugin receive notification from module', done => {
    ethdoc['source'].addEventListener('message', event => {
      const data = JSON.parse(event.data) as Partial<Message>
      if (data.key === 'handshake') return
      expect(data.payload).toEqual({ data: '0x' })
      done()
    }, false)
    txemitter.createTx('0x')
  })

  /*
  test('Plugin receive notification from another plugin', done => {
    app.activateOne('vyperCompiler')
    const message = {
      action: 'notification',
      name: 'vyperCompiler',
      key: 'compilationFinished',
      payload: '0x'
    } as Partial<Message>
    ethdoc['source'].addEventListener('message', event => {
      const data = JSON.parse(event.data) as Partial<Message>
      if (data.key === 'handshake') return
      expect(data.payload).toEqual({ data: '0x' })
      done()
    }, false)
    vyper['source'].addEventListener('message', event => {
      console.log('source', event.source)
      console.log('origin', event.origin)
    }, false)
  })
  */
})
