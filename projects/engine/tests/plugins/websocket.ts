import { WebsocketPlugin } from "../../src/plugin/websocket"
import { PluginManager } from "../../src/plugin/manager"
import { Engine } from "../../src/engine/next-gen-engine"
import { pluginManagerProfile } from "@utils"

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

describe.only('Websocket plugin', () => {
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
    }, 100)
  })

  test('Deactivation', async () => {
    plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalled()
    expect(plugin.connect).toHaveBeenCalled()
    expect(plugin.socket.removeEventListener).toHaveBeenCalledTimes(2) // reconnectOnclose & listener
    expect(plugin.socket.close).toHaveBeenCalled()
  })
})
