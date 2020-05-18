import { Engine } from '../src/engine'
import { PluginConnector } from '../src/connector'
import { PluginManager } from '../src/plugin/manager'
import { pluginManagerProfile } from "../../utils"

class MockPlugin extends PluginConnector {
  callMockEvent: (...payload: any[]) => any
  send = jest.fn()
  connect = jest.fn()
  disconnect = jest.fn()
  call: jest.Mock
  on: jest.Mock
  once: jest.Mock
  off: jest.Mock
  emit: jest.Mock
  constructor() {
    super({ name: 'connector', url: 'url' })
  }
  createMock() {
    this.call = jest.fn()
    this.on = jest.fn((name, method, cb) => this.callMockEvent = (...payload) => cb(...payload))
    this.once = jest.fn()
    this.off = jest.fn()
    this.emit = jest.fn()
  }
}

describe('Connector', () => {
  let manager: PluginManager
  let plugin: MockPlugin

  beforeEach(async () => {
    manager = new PluginManager(pluginManagerProfile)
    const engine = new Engine(manager)
    await engine.onload()
    plugin = new MockPlugin()
    engine.register(plugin)
    plugin.createMock()
  })

  test('activation should call connect', () => {
    plugin.activate()
    expect(plugin.connect).toHaveBeenCalled()
  })

  test('deactivate should call disconnect', () => {
    plugin['loaded'] = true
    plugin.deactivate()
    expect(plugin['loaded']).toBeFalsy()
    expect(plugin.disconnect).toHaveBeenCalled()
  })

  // Get Message: request
  test('[getMessage] request shoud trigger "call"', () => {
    const message = { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'manager' } as any
    plugin['getMessage'](message)
    expect(plugin.call).toHaveBeenCalledWith('manager', 'method', 'params')
  })

  // Get Message: listen
  test('[getMessage] request shoud trigger "on"', () => {
    const message = { id: 0, action: 'listen', key: 'method', payload: ['params'], name: 'manager' } as any
    plugin['getMessage'](message)
    expect(plugin.on.mock.calls[0][0]).toEqual('manager')
    expect(plugin.on.mock.calls[0][1]).toEqual('method')

    plugin.callMockEvent('params')
    plugin.callMockEvent('params')
    plugin.callMockEvent('params')
    const response = { action: 'notification', key: 'method', payload: ['params'], name: 'manager' } as any
    expect(plugin.send).toHaveBeenCalledWith(response)
    expect(plugin.send).toHaveBeenCalledTimes(3)
  })

  // getMessage once
  // We are not testing the once functionality here, this is done by the engine
  test('[getMessage] request shoud trigger "once"', () => {
    const message = { id: 0, action: 'once', key: 'method', payload: ['params'], name: 'manager' } as any
    plugin['getMessage'](message)
    expect(plugin.once.mock.calls[0][0]).toEqual('manager')
    expect(plugin.once.mock.calls[0][1]).toEqual('method')
  })

  // getMessage off
  test('[getMessage] request shoud trigger "once"', () => {
    const message = { id: 0, action: 'off', key: 'method', payload: ['params'], name: 'manager' } as any
    plugin['getMessage'](message)
    expect(plugin.off).toHaveBeenCalledWith('manager', 'method')
  })

})