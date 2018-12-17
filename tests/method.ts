import { Plugin, AppManager } from '../src'
import { ResolverApi, ResolverProfile } from '../examples/modules'
import { EthdocProfile } from '../examples/plugins'

describe('Method', () => {

  let app: AppManager
  let module: ResolverApi
  let plugin: Plugin
  beforeAll(() => {
    console.log({EthdocProfile})
    module = new ResolverApi()
    plugin = new Plugin(EthdocProfile)
    app = new AppManager({
      modules: [{ json: ResolverProfile, api: module }],
      plugins: [{ json: EthdocProfile, api: plugin }]
    })
  })

  test('call a method from plugin api', () => {
    const spy = spyOn(app[module.type], 'getFile')
    plugin.request({ type: module.type, key: 'getFile', value: 'Ballot.sol' })
    expect(spy).toBeCalledWith('Ballot.sol')
  })
})