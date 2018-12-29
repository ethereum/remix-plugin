import { Plugin, AppManager } from '../src'
import { PluginManagerProfile, PluginManagerApi } from '../examples/modules'

const EthdocProfile = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: ''
}

describe('Boostrap', () => {
  let app: AppManager
  let api: Plugin
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
  test('plugin should not be activated by default', () => expect(app[api.type]).toEqual({}))
  test('pluginManager should activate plugin', () => {
    console.log(app)
    pluginManager.events.emit('activate', api.type)
    expect(app[api.type]['getDoc']).toBeDefined()
  })
})
