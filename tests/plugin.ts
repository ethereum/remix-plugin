import { Plugin, PluginProfile } from '../src'
import { Ethdoc } from './../examples/plugins'
import { RemixAppManager, PluginManagerComponent } from '../examples/modules'

const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: 'some-url'
}

describe('Plugin', () => {
  let app: RemixAppManager
  let component: PluginManagerComponent
  let api: Plugin<Ethdoc>
  beforeAll(() => {
    api = new Plugin(EthdocProfile)
    component = new PluginManagerComponent()
    app = new RemixAppManager(component)
    app.init([{ profile: EthdocProfile, api }])
  })
  test('is added to app', () => {
    expect(app['calls'][api.type]).toBeDefined()
  })
  test('method is added to app', () => {
    expect(app['calls'][api.type]['getDoc']).toBeDefined()
  })
})
