import { Plugin, PluginProfile } from '../src'
import { RemixAppManager, Store } from '../examples/modules'
import { Ethdoc } from './../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getdoc'],
  url: 'some-url'
}

describe('Boostrap', () => {
  let app: RemixAppManager
  let ethdoc: Plugin<Ethdoc>
  beforeAll(() => {
    ethdoc = new Plugin(EthdocProfile)
    app = new RemixAppManager(new Store())
    app.registerOne<Ethdoc>(ethdoc)
  })
  test('Plugin Entity should be registered', () => {
    expect(app.getEntity(EthdocProfile.name)).toEqual(ethdoc)
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
