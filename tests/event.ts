import { Plugin, PluginProfile, Message } from '../src'
import {
  TxlistenerApi,
  TxEmitter,
  RemixAppManager,
  Store,
} from '../examples/modules'
import { Ethdoc, VyperCompiler } from '../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getdoc'],
  events: ['newDoc'],
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
  let txlistener: TxlistenerApi
  let ethdoc: Plugin<Ethdoc>
  let vyper: Plugin<VyperCompiler>
  let txemitter: TxEmitter
  beforeEach(() => {
    txemitter = new TxEmitter()
    txlistener = new TxlistenerApi(txemitter)
    ethdoc = new Plugin(EthdocProfile)
    vyper = new Plugin(VyperCompilerProfile)
    app = new RemixAppManager(new Store())
    app.init([txlistener.api(), ethdoc])
    app.registerOne(vyper)
  })
  test('event from module is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith(txlistener.name, 'newTransaction', [{ data: '0x' }])
  })

  test('event from module is received by ethdoc', () => {
    const spy = spyOn(ethdoc, 'postMessage' as any)
    txemitter.createTx('0x')
    expect(spy).toBeCalledWith({
      action: 'notification',
      name: txlistener.name,
      key: 'newTransaction',
      payload: [{ data: '0x' }],
    })
  })

  test('event from ethdoc is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    if (!EthdocProfile.events)
      throw new Error('EthdocProfile should have "events"')
    ethdoc.events.emit('newDoc', 'Documentation')
    expect(spy).toBeCalledWith(ethdoc.name, EthdocProfile.events[0], ['Documentation'])
  })

  test('event from ethdoc is broadcasted', () => {
    const spy = spyOn(app, 'broadcast' as any)
    ethdoc.events.emit('statusChanged', { key: 'check', type: 'success', title: 'Documentation ready !' })
    expect(spy).toBeCalledWith(ethdoc.name, 'statusChanged', [{ key: 'check', type: 'success', title: 'Documentation ready !' }])
  })

  /*
  test('Plugin receive notification from module', done => {
    ethdoc['source'].addEventListener('message', event => {
      const data = JSON.parse(event.data) as Partial<Message>
      if (data.key === 'handshake') return
      expect(data.payload).toEqual({ data: '0x' })
      done()
    }, false)
    txemitter.createTx('0x')
  })

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
