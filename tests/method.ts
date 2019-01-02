import { Plugin, AppManager, PluginProfile } from '../src'
import { ResolverApi, ResolverProfile, Resolver } from '../examples/modules'
import { Ethdoc } from './../examples/plugins/ethdoc'

const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: ''
}

export interface IAppManager {
  modules: {
    solResolver: Resolver
  }
  plugins: {
    ethdoc: Ethdoc
  }
}

describe('Method', () => {
  let app: AppManager<IAppManager>
  let module: ResolverApi
  let plugin: Plugin<Ethdoc>
  beforeAll(() => {
    module = new ResolverApi()
    plugin = new Plugin(EthdocProfile)
    app = new AppManager({
      modules: [{ json: ResolverProfile, api: module }],
      plugins: [{ json: EthdocProfile, api: plugin }]
    })
    app.activate(EthdocProfile.type)
  })

  test('call a method from plugin api', () => {
    const spy = spyOn(app.calls.solResolver, 'getFile')
    plugin.request({ type: module.type, key: 'getFile', value: 'Ballot.sol' })
    expect(spy).toBeCalledWith('Ballot.sol')
  })

})