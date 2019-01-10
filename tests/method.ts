import { Plugin, PluginProfile } from '../src'
import {
  ResolverApi,
  ResolverProfile,
  Resolver,
  PluginManagerComponent,
  RemixAppManager,
} from '../examples/modules'
import { Ethdoc } from './../examples/plugins/ethdoc'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getDoc'],
  url: 'some-url'
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
  let app: RemixAppManager
  let component: PluginManagerComponent
  let module: ResolverApi
  let plugin: Plugin<Ethdoc>
  beforeAll(() => {
    module = new ResolverApi()
    plugin = new Plugin(EthdocProfile)
    component = new PluginManagerComponent()
    app = new RemixAppManager(component)
    app.init([
      { profile: ResolverProfile, api: module },
      { profile: EthdocProfile, api: plugin },
    ])
  })

  test('call a method from plugin api', () => {
    const spy = spyOn(app['calls'][ResolverProfile.name], 'getFile')
    plugin.request({ name: module.name, key: 'getFile', payload: 'Ballot.sol' })
    expect(spy).toBeCalledWith('Ballot.sol')
  })
})
