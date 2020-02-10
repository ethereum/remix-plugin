import { listenEvent, compilerProfile, filSystemProfile, pluginManagerProfile } from '../../utils'
import { Engine } from '../src/engine/next-gen-engine'
import { Plugin } from '../src/plugin/abstract'
import { PluginManager } from '../src/plugin/manager'

export class MockEngine extends Engine {
  onRegistration = jest.fn()
}

export class MockManager extends PluginManager {
  activatePlugin = jest.fn(super.activatePlugin)
  deactivatePlugin = jest.fn(super.deactivatePlugin)
  onRegistration = jest.fn()
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onPluginActivated = jest.fn()
  onPluginDeactivated = jest.fn()
  onProfileAdded = jest.fn()
  canActivate = jest.fn(async () => true)
  canDeactivate = jest.fn(async (from) => from.name === 'manager' ? true : false)
  canCall = jest.fn(async () => true)
  constructor() {
    super(pluginManagerProfile)
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

  test('Listeners with "on" are registered', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', (file: any) => {
      expect(file).toEqual('newFile')
      done()
    })
    engine['events']['solidity'][event]('newFile')
  })

  test('Engine catch event emitted by activated plugins', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    engine['listeners'][event] = ['solidity'] // Need to register a listener else nothing is broadcasted
    engine['events']['solidity'][event] = (file) => {
      expect(file).toEqual('newFile')
      done()
    }
    fileManager.emit('currentFileChanged', 'newFile')
  })

})

describe('Plugin interaction', () => {
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

  // Call

  test('Plugin can call another plugin method', async () => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    await fileManager.call('solidity', 'compile', 'ballot.sol')
    expect(solidity.compile).toHaveBeenCalledWith('ballot.sol')
  })

  test('Plugin can activate another', async () => {
    await manager.activatePlugin('solidity')
    await solidity.call('manager', 'activatePlugin', 'fileManager')
    const isActive = await manager.isActive('fileManager')
    expect(manager.activatePlugin).toHaveBeenCalledWith('fileManager')
    expect(manager.canActivate).toHaveBeenCalledWith(solidity.profile, manager.profile)
    expect(isActive).toBeTruthy()
  })

  test('Plugin cannot deactivate another by default', async () => {
    try {
      await manager.activatePlugin(['solidity', 'fileManager'])
      await solidity.call('manager', 'deactivatePlugin', 'fileManager')
    } catch (err) {
      expect(err.message).toEqual('Plugin solidity has no right to deactivate plugin fileManager')
      const isActive = await manager.isActive('fileManager')
      expect(manager.canActivate).toHaveBeenCalledWith(solidity.profile, manager.profile)
      expect(isActive).toBeTruthy()
    }
  })

  test('Plugin can deactivate another if permitted', async () => {
    manager.canDeactivate = jest.fn(async (from) => true)
    await manager.activatePlugin(['solidity', 'fileManager'])
    await solidity.call('manager', 'deactivatePlugin', 'fileManager')
    const isActive = await manager.isActive('fileManager')
    expect(manager.deactivatePlugin).toHaveBeenCalledWith('fileManager')
    expect(manager.canActivate).toHaveBeenCalledWith(solidity.profile, manager.profile)
    expect(isActive).toBeFalsy()
  })

  // On

  test('Plugin can listen on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.on('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(2)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

  // Once

  test('Plugin can listen once on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.once('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(1)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

  // Off
  test('Plugin can listen once on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.on('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    solidity.off('fileManager', 'currentFileChanged')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(1)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

})