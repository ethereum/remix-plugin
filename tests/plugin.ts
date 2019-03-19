import { Plugin, PluginProfile } from '../src'
import { Ethdoc } from './../examples/plugins'
import { RemixAppManager, Store } from '../examples/modules'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  events: ['newDoc'],
  methods: ['getdoc'],
  notifications: {
    'solCompiler': ['getCompilationFinished']
  },
  url: 'https://ipfs.io/ipfs/Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ/'
}


describe('Plugin', () => {
  let app: RemixAppManager
  let ethdoc: Plugin<Ethdoc>
  beforeEach(() => {
    ethdoc = new Plugin(EthdocProfile)
    app = new RemixAppManager(new Store())
    app.init([ethdoc])
  })
  test('is added to app', () => {
    expect(app['calls'][ethdoc.name]).toBeDefined()
  })
  test('method is added to app', () => {
    expect(app['calls'][ethdoc.name]['getdoc']).toBeDefined()
  })

  test('Plugin should have a request function', () => {
    expect(ethdoc.request).toBeDefined()
  })

  test('Iframe should render', () => {
    ethdoc.render()
    expect(ethdoc['iframe'].src).toEqual(EthdocProfile.url)
  })


  /*
  test('Plugin should get handshake', (done) => {
    const handshake = { action: 'request', name: EthdocProfile.name, key: 'handshake' } as Partial<Message>
    ethdoc['source'].addEventListener('message', event => {
      expect(JSON.parse(event.data)).toEqual(handshake)
      done()
    }, false)
    ethdoc['postMessage'](handshake)
  })

  test('Plugin should get a message', (done) => {
    const msg = { action: 'request', name: EthdocProfile.name, key: 'test' } as Partial<Message>
    ethdoc['source'].addEventListener('message', event => {
      const data = JSON.parse(event.data) as Partial<Message>
      if (data.key === 'handshake') return
      expect(data).toEqual(msg)
      done()
    }, false)
    ethdoc['postMessage'](msg)
  })
  */
})
