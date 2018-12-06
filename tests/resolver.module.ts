import {
  AppManager,
  ProfileConfig,
  ResolverProfile,
  resolverProfile,
  ResolverService,
} from './../src'

// MOCKS
// Resolver
const resolverService: ResolverService = {
  combineSource(path: string) {
    console.log(path)
  },
  getFile(url: string): string {
    return 'myFile'
  }
}

// AppManager Interface
interface Manager {
  modules: {
    solResolver: ResolverProfile
  }
  plugins: {}
  providers: {}
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

  test('Resolver is activated', async () => {
    const resolver = manager.modules.solResolver
    expect(resolver.calls.getFile('url')).toEqual('myFile')
  })

  test('Resolver Combine Source', async () => {
    const resolver = manager.modules.solResolver
    const spy = jest.spyOn(resolver.calls, 'combineSource')
    manager.calls.solResolver.combineSource('path')
    expect(spy).toBeCalled()
  })
})
