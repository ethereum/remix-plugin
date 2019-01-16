import { Plugin, PluginProfile, Message } from '../src'
import { Ethdoc } from './../examples/plugins'
import { RemixAppManager, PluginManagerComponent } from '../examples/modules'

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
  let component: PluginManagerComponent
  let api: Plugin<Ethdoc>
  beforeEach(() => {
    api = new Plugin(EthdocProfile)
    component = new PluginManagerComponent()
    app = new RemixAppManager(component)
    app.init([{ profile: EthdocProfile, api }])
  })
  test('is added to app', () => {
    expect(app['calls'][api.name]).toBeDefined()
  })
  test('method is added to app', () => {
    expect(app['calls'][api.name]['getdoc']).toBeDefined()
  })

  test('Iframe should have src settled', () => {
    expect(api['iframe'].src).toEqual(EthdocProfile.url)
  })

  test('Plugin should get handshake', (done) => {
    const handshake = { action: 'request', name: EthdocProfile.name, key: 'handshake' }
    api['source'].addEventListener('message', event => {
      expect(JSON.parse(event.data)).toEqual(handshake)
      done()
    }, false)
  })

  test('Plugin should get a message', (done) => {
    const msg = { action: 'request', name: EthdocProfile.name, key: 'test' } as Partial<Message>
    api['source'].addEventListener('message', event => {
      const data = JSON.parse(event.data) as Partial<Message>
      if (data.key === 'handshake') return
      expect(data).toEqual(msg)
      done()
    }, false)
    api['postMessage'](msg)
  })
})
