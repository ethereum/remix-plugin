import { Plugin, AppManager, PluginProfile } from '../src'
import { Ethdoc } from './../examples/plugins'

const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: ''
}

interface IAppManager {
  modules: {},
  plugins: {
    'ethdoc': Ethdoc
  }
}

describe('Plugin', () => {
  let app: AppManager<IAppManager>
  let api: Plugin<Ethdoc>
  beforeAll(() => {
    api = new Plugin(EthdocProfile)
    app = new AppManager({
      plugins: [{ json: EthdocProfile, api }]
    })
    app.activate(api.type)
  })
  test('is added to app', () => expect(app.calls[api.type]).toBeDefined())
  test('method is added to app', () => expect(app.calls.ethdoc['getDoc']).toBeDefined())
})
