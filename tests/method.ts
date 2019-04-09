import { Plugin, PluginProfile } from '../src'
import {
  ResolverApi,
  ResolverProfile,
  Store,
  RemixAppManager,
} from '../examples/modules'
import { Ethdoc } from './../examples/plugins/ethdoc'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getdoc'],
  url: 'some-url'
}


describe('Method', () => {
  let app: RemixAppManager
  let resolver: ResolverApi
  let ethdoc: Plugin<Ethdoc>
  beforeAll(() => {
    resolver = new ResolverApi()
    ethdoc = new Plugin(EthdocProfile)
    app = new RemixAppManager(new Store())
    app.init([resolver.api(), ethdoc])
  })

  test('call a method from plugin api', () => {
    if (!ResolverProfile.name) throw new Error('ResolverProfile should have a name')
    const spy = spyOn(app['calls'][ResolverProfile.name], 'getFile')
    ethdoc.request({ name: resolver.name, key: 'getFile', payload: ['Ballot.sol'] })
    expect(spy).toBeCalledWith({ from: ethdoc.name}, 'Ballot.sol')
  })
})
