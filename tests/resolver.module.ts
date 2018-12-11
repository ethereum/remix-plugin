import {
  AppManager,
  ProfileConfig,
} from './../src'

import {
  resolverProfile,
  ResolverProfile,
  IResolverService,
  resolverService
} from '../examples/modules'

// AppManager Interface
interface Manager {
  providers: {
    solResolver: IResolverService
  }
  modules: {
    solResolver: ResolverProfile
  }
  plugins: {}
}

describe('Resolver Module', () => {
  let manager: AppManager<Manager>

  beforeEach(() => {
    const config: ProfileConfig<Manager> = {
      providers: { solResolver: resolverService },
      modules: { solResolver: resolverProfile },
    }
    manager = AppManager.create(config)
  })

  test('Module Manager has Resolver', () => {
    expect(manager.modules.solResolver).toBeDefined()
  })

  test('Resolver calls method : getFile', async () => {
    const resolver = manager.modules.solResolver
    expect(resolver.calls.getFile('url')).toEqual('myFile')
  })

  test('Resolver calls method : combineSource', async () => {
    const resolver = manager.modules.solResolver
    const spy = jest.spyOn(resolver.calls, 'combineSource')
    manager.calls.solResolver.combineSource('path')
    expect(spy).toBeCalled()
  })
})
