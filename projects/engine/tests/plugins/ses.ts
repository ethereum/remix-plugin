import { SesPlugin } from "../../src/plugin/ses"
import { PluginManager } from "../../src/plugin/manager"
import { Engine } from "../../src/engine/engine"
import { pluginManagerProfile } from "../../../utils"

const profile = {
  name: 'ses',
  methods: ['mockMethod'],
  url: 'url'
}

// Simple plgin that return the message as it
const code = `host.on(message => host.send(message))`;

(window.fetch as any) = (url) => {
  return Promise.resolve({ text: () => Promise.resolve(code)})
}

class MockSes extends SesPlugin {
  call: jest.Mock
  on: jest.Mock
  once: jest.Mock
  off: jest.Mock
  emit: jest.Mock
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  onActivation = jest.fn()
  constructor() {
    super(profile)
  }
  createMock() {
    this.call = jest.fn()
    this.on = jest.fn()
    this.once = jest.fn()
    this.off = jest.fn()
    this.emit = jest.fn()
  }
}

describe.only('SES plugin', () => {
  let manager: PluginManager
  let plugin: MockSes

  beforeEach(async () => {
    manager = new PluginManager(pluginManagerProfile)
    const engine = new Engine(manager)
    await engine.onload()
    plugin = new MockSes()
    engine.register(plugin)
  })

  test('Activation', async () => {
    await plugin.activate()
    expect(plugin.onActivation).toHaveBeenCalled()
  })

  test('Deactivation', () => {
    plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalled()
  })

  test('Post Message fails if plugin is not activated', () => {
    try {
      plugin['postMessage']({ name: 'socket' })
    } catch (err) {
      expect(err.message).toBe('Plugin "ses" has not been activated yet')
    }
  })

  test('Post Message', async () => {
    await plugin.activate()
    plugin['postMessage']({ name: 'socket' })
    expect(plugin['getMessage']).toHaveBeenCalledWith({ name: 'socket' })
  })

  test('Call Plugin Method', (done) => {
    const spy = spyOn(plugin, 'postMessage' as any)
    const call = plugin['callPluginMethod']('key', ['payload'])
    const msg = { id: 0, action: 'request', key: 'key', payload: ['payload'], name: 'ses', requestInfo: undefined }
    expect(spy).toHaveBeenCalledWith(msg)
    call.then((res) => {
      expect(res).toBeTruthy()
      done()
    })
    plugin['pendingRequest'][0](true, undefined)
  })

  test('Get Message', () => {
    plugin.createMock()
    // Action 'on'
    const on = { id: 0, action: 'on', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](on)
    expect(plugin.on.mock.calls[0][0]).toEqual('name')
    expect(plugin.on.mock.calls[0][1]).toEqual('key')
    // Action 'once'
    const once = { id: 0, action: 'once', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](once)
    expect(plugin.once.mock.calls[0][0]).toEqual('name')
    expect(plugin.once.mock.calls[0][1]).toEqual('key')
    // Action 'off'
    const off = { id: 0, action: 'off', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](off)
    expect(plugin.off).toHaveBeenCalledWith('name', 'key')
    // Action 'emit'
    const emit = { id: 0, action: 'emit', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](emit)
    expect(plugin.emit).toHaveBeenCalledWith('key', 'payload')
  })
})
