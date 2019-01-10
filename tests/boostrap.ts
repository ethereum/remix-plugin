import { Plugin, PluginProfile } from '../src'
import { RemixAppManager, PluginManagerComponent } from '../examples/modules'
import { Ethdoc } from './../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: 'some-url'
}

describe('Boostrap', () => {
  let app: RemixAppManager
  let api: Plugin<Ethdoc>
  let component: PluginManagerComponent
  beforeAll(() => {
    component = new PluginManagerComponent()
    api = new Plugin(EthdocProfile)
    app = new RemixAppManager(component)
    app.registerOne<Ethdoc>({ profile: EthdocProfile, api })
  })
  test('Plugin Entity should be registered', () => {
    expect(app.getEntity(EthdocProfile.type)).toEqual({ profile: EthdocProfile, api })
  })
  test('Plugin Entity method should not be available before activation', () => {
    expect(app['calls'][EthdocProfile.type]).toBeUndefined()
  })
  test('pluginManager should activate plugin', () => {
    app.activateOne(EthdocProfile.type)
    expect(app['calls'][EthdocProfile.type]['getDoc']).toBeDefined()
  })
})
