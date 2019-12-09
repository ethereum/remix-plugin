// import { Solidity } from '../../../examples/native-plugins/solidity'
// import { FileManager } from '../../../examples/native-plugins/file-manager'
import { listenEvent, compilerProfile, filSystemProfile } from '../../utils'
import { Engine } from '../src/engine/next-gen-engine'
import { Plugin } from '../src/plugin/abstract'
import { PluginManager } from '../src/plugin/manager'

export class MockEngine extends Engine {
  onRegistration = jest.fn()
}

export class MockManager extends PluginManager {
  onRegistration = jest.fn()
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onPluginActivated = jest.fn()
  onPluginDeactivated = jest.fn()
  onProfileAdded = jest.fn()
  constructor() {
    super({ name: 'manager', methods: [] })
  }
}

export class MockSolidity extends Plugin {
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  compile = jest.fn()
  getCompilationResult = jest.fn()
  constructor() {
    super({ ...compilerProfile, name: 'solidity' })
  }
}


export class MockFileManager extends Plugin {
  private files: Record<string, string> = {}
  private active: string

  constructor() {
    super({ ...filSystemProfile, name: 'fileManager' })
  }

  getCurrentFile = jest.fn(() => this.files[this.active])
  getFile = jest.fn((path: string) => this.files[path])
  getFolder = jest.fn(() => ({}))
  setFile = jest.fn((path: string, content: string) => this.files[path] = content)
  switchFile = jest.fn((path: string) => {
    this.active = path
    this.emit('currentFileChanged', path)
  })
}

describe('Registration with Engine', () => {

  test('Manager is registered', async () => {
    const manager = new MockManager()
    const engine = new MockEngine(manager)
    await engine.onload()
    expect(engine.isRegistered('manager')).toBeTruthy()
  })

  test('Manager emit onActivation', async () => {
    const manager = new MockManager()
    const engine = new MockEngine(manager)
    await engine.onload()
    expect(manager.onActivation).toHaveBeenCalledTimes(1)
  })

  test('Manager does not emit onRegistration for itself', async () => {
    const manager = new MockManager()
    const engine = new MockEngine(manager)
    await engine.onload()
    expect(manager.onRegistration).toHaveBeenCalledTimes(0)
    expect(engine.onRegistration).toHaveBeenCalledTimes(0)
  })

  test('Call onRegistration for other plugins', async () => {
    const manager = new MockManager()
    const engine = new MockEngine(manager)
    const solidity = new MockSolidity()
    await engine.onload()
    engine.register([solidity, new MockFileManager()])
    expect(engine.onRegistration).toHaveBeenCalledTimes(2)
    expect(manager.onProfileAdded).toHaveBeenCalledTimes(2)
    expect(solidity.onRegistration).toHaveBeenCalledTimes(1)
  })
})

describe('Manager', () => {
  let manager: MockManager
  let solidity: MockSolidity
  let fileManager: MockFileManager
  let engine: Engine

  beforeEach(async () => {
    solidity = new MockSolidity()
    fileManager = new MockFileManager()
    manager = new MockManager()
    engine = new MockEngine(manager)
    await engine.onload()
    engine.register([solidity, fileManager])
  })

  test('Activation', async () => {
    const spyEmit = spyOn(manager, 'emit')
    await manager.activatePlugin('solidity')
    expect(manager.onPluginActivated).toHaveBeenCalledTimes(1)
    expect(solidity.onActivation).toBeCalledTimes(1)
    expect(await manager.isActive('solidity')).toBeTruthy()
    expect(spyEmit).toHaveBeenCalledWith('pluginActivated', solidity.profile)
  })

  test('Deactivation', async () => {
    const spyEmit = spyOn(manager, 'emit')
    await manager.activatePlugin('solidity')
    await manager.deactivatePlugin('solidity')
    expect(manager.onPluginDeactivated).toHaveBeenCalledTimes(1)
    expect(solidity.onDeactivation).toBeCalledTimes(1)
    expect(await manager.isActive('solidity')).toBeFalsy()
    expect(spyEmit).toHaveBeenCalledWith('pluginDeactivated', solidity.profile)
  })

  test('Toggle activation', async () => {
    const onActivation = spyOn(solidity, 'onActivation')
    const onDeactivation = spyOn(solidity, 'onDeactivation')
    await manager.toggleActive('solidity')
    await manager.toggleActive('solidity')
    expect(onActivation).toBeCalledTimes(1)
    expect(onDeactivation).toBeCalledTimes(1)
  })

})


describe('Remix Engine', () => {
  let manager: MockManager
  let solidity: MockSolidity
  let fileManager: MockFileManager
  let engine: Engine

  beforeEach(async () => {
    solidity = new MockSolidity()
    fileManager = new MockFileManager()
    manager = new MockManager()
    engine = new MockEngine(manager)
    await engine.onload()
    engine.register([solidity, fileManager])
  })

  test('Listening to event should add a event record', async () => {
    await manager.activatePlugin('solidity')
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', () => {})
    expect(engine['listeners'][event][0]).toEqual('solidity')
  })

  test.only('Listeners with "on" are registered', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', file => {
      expect(file).toEqual('newFile')
      done()
    })
    engine['events']['solidity'][event]('newFile')
  })

  test('Engine catch event emitted by activated plugins', done => {
    manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    engine['listeners'][event] = ['solidity'] // Need to register a listener else nothing is broadcasted
    engine['events']['solidity'][event] = (file) => {
      expect(file).toEqual('newFile')
      done()
    }
    fileManager.emit('currentFileChanged', 'newFile')
  })

  // test('Can change settings of engine', () => {
  //   expect(engine['settings'].autoActivate).toBeFalsy()
  //   engine.setSettings('autoActivate', true)
  //   expect(engine['settings'].autoActivate).toBeTruthy()
  // })

  // test('Engine do not autoactivate plugin by default', () => {
  //   manager.activatePlugin('solidity')
  //   solidity.call('fileManager', 'setFile', 'browser/file.sol', 'content')
  //   const spy = spyOn(engine, 'onActivated')
  //   expect(spy).not.toHaveBeenCalled()
  // })

  // test('Engine autoactivate plugin with settings', () => {
  //   engine.setSettings('autoActivate', true)
  //   manager.activatePlugin('solidity')
  //   const spy = spyOn(fileManager, 'activate')
  //   solidity.call('fileManager', 'setFile', 'browser/file.sol', 'content')
  //   expect(spy).toHaveBeenCalledTimes(1)
  // })
})
