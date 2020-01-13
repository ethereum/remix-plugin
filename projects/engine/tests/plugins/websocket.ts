import { WebsocketPlugin } from "../../src/plugin/websocket"
import { PluginManager } from "../../src/plugin/manager"
import { Engine } from "../../src/engine/next-gen-engine"
import { pluginManagerProfile } from "../../../utils"

const profile = {
  name: 'websocket',
  methods: ['mockMethod'],
  url: 'url'
}

class MockSocket extends WebsocketPlugin {
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  call = jest.fn()
  on = jest.fn()
  once = jest.fn()
  off = jest.fn()
  emit = jest.fn()
  socket = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    close: jest.fn(),
    send: jest.fn()
  } as any
  connect = jest.fn()
  constructor() {
    super(profile)
  }
}

describe('Websocket plugin', () => {
  let manager: PluginManager
  let plugin: MockSocket

  beforeEach(async () => {
    manager = new PluginManager(pluginManagerProfile)
    const engine = new Engine(manager)
    await engine.onload()
    plugin = new MockSocket()
    engine.register(plugin)
  })

  test('Activation', async () => {
    await plugin.activate()
    expect(plugin.onActivation).toHaveBeenCalled()
    expect(plugin.connect).toHaveBeenCalled()
    expect(plugin.socket.addEventListener).toHaveBeenCalled() // reconnectOnclose
  })

  test('Reconnect', (done) => {
    plugin['reconnect']()
    setTimeout(() => {
      expect(plugin.connect).toHaveBeenCalled()
      done()
    }, 1500)
  })

  test('Deactivation', (done) => {
    plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalled()
    expect(plugin.socket.removeEventListener).toHaveBeenCalledTimes(2) // reconnectOnclose & listener
    expect(plugin.socket.close).toHaveBeenCalled()
    setTimeout(() => {
      expect(plugin.connect).not.toHaveBeenCalled() // Remove listener should block reconnection attempt
      done()
    }, 1500)
  })

  test('Post Message fails if socket not open', () => {
    try {
      plugin.socket.readyState = true
      plugin.socket.OPEN = false
      plugin['postMessage']({ name: 'socket' })
    } catch (err) {
      expect(err.message).toBe('Websocket connection is not open yet')
    }
  })

  test('Post Message', () => {
    plugin.socket.readyState = true
    plugin.socket.OPEN = true
    plugin['postMessage']({ name: 'socket' })
    expect(plugin.socket.send).toHaveBeenCalledWith(JSON.stringify({ name: 'socket' }))
  })

  test('Call Plugin Method', (done) => {
    const spy = spyOn(plugin, 'postMessage' as any)
    const call = plugin['callPluginMethod']('key', ['payload'])
    const msg = { id: 0, action: 'request', key: 'key', payload: ['payload'], name: 'websocket', requestInfo: undefined }
    expect(spy).toHaveBeenCalledWith(msg)
    call.then((res) => {
      expect(res).toBeTruthy()
      done()
    })
    plugin['pendingRequest'][0](true, undefined)
  })

  test('Get Message', () => {
    // Action 'on'
    const on = { id: 0, action: 'on', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getMessage']({ data: JSON.stringify(on) } as any)
    expect(plugin.on.mock.calls[0][0]).toEqual('name')
    expect(plugin.on.mock.calls[0][1]).toEqual('key')
    // Action 'once'
    const once = { id: 0, action: 'once', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getMessage']({ data: JSON.stringify(once) } as any)
    expect(plugin.once.mock.calls[0][0]).toEqual('name')
    expect(plugin.once.mock.calls[0][1]).toEqual('key')
    // Action 'off'
    const off = { id: 0, action: 'off', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getMessage']({ data: JSON.stringify(off) } as any)
    expect(plugin.off).toHaveBeenCalledWith('name', 'key')
    // Action 'emit'
    const emit = { id: 0, action: 'emit', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getMessage']({ data: JSON.stringify(emit) } as any)
    expect(plugin.emit).toHaveBeenCalledWith('key', 'payload')

  })
})
