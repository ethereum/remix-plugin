import { Plugin, PluginProfile } from '../src'
import { RemixAppManager, PluginManagerComponent } from '../examples/modules'
import { Ethdoc } from './../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getdoc'],
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
    expect(app.getEntity(EthdocProfile.name)).toEqual({ profile: EthdocProfile, api })
  })
  test('Plugin Entity method should not be available before activation', () => {
    expect(app['calls'][EthdocProfile.name]).toBeUndefined()
  })
  test('pluginManager should activate plugin', () => {
    app.activateOne(EthdocProfile.name)
    expect(app['calls'][EthdocProfile.name]['getdoc']).toBeDefined()
  })
  test('method activateOne should call setActive', () => {
    const spy = spyOn(app, 'setActive')
    app.activateOne(EthdocProfile.name)
    expect(spy).toBeCalledWith(EthdocProfile.name, true)
  })
})
