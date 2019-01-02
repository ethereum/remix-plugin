import { AppManager, Module, Injector, InjectorFactory } from './../src/experimental'

@Module({
  type: 'test',
  deps: []
})
export class TestModule extends Injector {


  superTest() {
    return 'super test'
  }
}

@Module({
  type: 'test2',
  deps: ['test']
})
export class Test2Module extends Injector {
  constructor(private test: TestModule) {
    super()
  }

  tester() {
    return this.test.superTest()
  }
}

const Test3 = InjectorFactory.create('test', [], () => {
  return {
    superTest() {
      return 'super test'
    }
  }
})

class Test4 {
  static type = 'test'
  static deps = []
  static useFactory() {
    return new Test4()
  }

  constructor() {}

  superTest() {
    return 'super test'
  }
}

describe('Test injection module', () => {
  test('Inject in disorder', () => {
    const manager = new AppManager([Test2Module, TestModule])
    const injectorTree = manager.modules
    const tester = injectorTree['test2']['tester']()
    expect(tester).toEqual('super test')
  })

  test('Inject non module injector', () => {
    const manager = new AppManager([Test2Module, Test3])
    const injectorTree = manager.modules
    const tester = injectorTree['test2']['tester']()
    expect(tester).toEqual('super test')
  })

})
