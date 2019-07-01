import { RemixPluginEngine } from '@examples/engine/remix-plugin-engine'
import { Solidity } from '@examples/native-plugins/solidity'
import { FileManager } from '@examples/native-plugins/file-manager'
import { listenEvent } from '@utils'

describe('Remix Engine', () => {
  let solidity: Solidity
  let fileManager: FileManager

  test('Registration', () => {
    solidity = new Solidity()
    fileManager = new FileManager()
    const _engine = new RemixPluginEngine({})
    const spy = spyOn(_engine, 'onRegistration')
    _engine.register([solidity, fileManager])
    expect(spy).toBeCalledTimes(2)
  })

  let engine: RemixPluginEngine

  beforeEach(() => {
    solidity = new Solidity()
    fileManager = new FileManager()
    const plugins = Object.freeze({ solidity, fileManager })
    engine = new RemixPluginEngine(plugins)
  })

  test('Activation', () => {
    const spyEngine = spyOn(engine, 'onActivation')
    const spyPlugin = spyOn(solidity, 'onActivation')
    engine.activate('solidity')
    expect(spyEngine).toBeCalledWith(solidity)
    expect(spyPlugin).toBeCalledTimes(1)
    expect(engine.actives).toEqual(['solidity'])
  })

  test('Deactivation', () => {
    const spyEngine = spyOn(engine, 'onDeactivation')
    const spyPlugin = spyOn(solidity, 'onDeactivation')
    engine.activate('solidity')
    engine.deactivate('solidity')
    expect(spyEngine).toBeCalledWith(solidity)
    expect(spyPlugin).toBeCalledTimes(1)
    expect(engine.actives).toEqual([])
  })

  test('Listening to event should add a event record', () => {
    engine.activate(['solidity'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', () => {})
    expect(engine['listeners'][event][0]).toEqual('solidity')
  })

  test('Listeners with "on" are registered', done => {
    engine.activate(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', file => {
      expect(file).toEqual('newFile')
      done()
    })
    engine['events']['solidity'][event]('newFile')
  })

  test('Engine can call a method from an active plugin', async () => {
    engine.activate(['solidity', 'fileManager'])
    fileManager['files'] = { newFile: 'myContract' }
    const content = await engine['methods']['fileManager']['getFile'](
      { from: 'solidity' },
      'newFile',
    )
    expect(content).toEqual('myContract')
  })

  test('Engine catch event emitted by activated plugins', done => {
    engine.activate(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    engine['listeners'][event] = ['solidity'] // Need to register a listener else nothing is broadcasted
    engine['events']['solidity'][event] = file => {
      expect(file).toEqual('newFile')
      done()
    }
    fileManager.emit('currentFileChanged', 'newFile')
  })

  test('Can change settings of engine', () => {
    expect(engine['settings'].autoActivate).toBeFalsy()
    engine.setSettings('autoActivate', true)
    expect(engine['settings'].autoActivate).toBeTruthy()
  })

  test('Engine do not autoactivate plugin by default', () => {
    engine.activate('solidity')
    solidity.call('fileManager', 'setFile', 'browser/file.sol', 'content')
    const spy = spyOn(engine, 'onActivation')
    expect(spy).not.toHaveBeenCalled()
  })

  test('Engine autoactivate plugin with settings', () => {
    engine.setSettings('autoActivate', true)
    engine.activate('solidity')
    const spy = spyOn(fileManager, 'activate')
    solidity.call('fileManager', 'setFile', 'browser/file.sol', 'content')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
