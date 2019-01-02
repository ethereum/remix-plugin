import { Plugin, AppManager, PluginProfile } from '../src'
import { PluginManager, PluginManagerProfile, PluginManagerApi } from '../examples/modules'
import { Ethdoc } from './../examples/plugins'

const EthdocProfile: PluginProfile = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: ''
}

export interface IAppManager {
  modules: {
    pluginManager: PluginManager
  }
  plugins: {
    ethdoc: Ethdoc
  }
}

describe('Boostrap', () => {
  let app: AppManager<IAppManager>
  let api: Plugin<Ethdoc>
  let pluginManager: PluginManagerApi
  beforeAll(() => {
    pluginManager = new PluginManagerApi()
    api = new Plugin(EthdocProfile)
    app = new AppManager({
      modules: [{ json: PluginManagerProfile, api: pluginManager}],
      plugins: [{ json: EthdocProfile, api }],
      options: {
        boostrap: pluginManager.type
      }
    })
  })
  test('plugin should not be activated by default', () => expect(app.calls.ethdoc).toEqual({}))
  test('pluginManager should activate plugin', () => {
    pluginManager.events.emit('activate', api.type)
    expect(app.calls.ethdoc['getDoc']).toBeDefined()
  })
})
