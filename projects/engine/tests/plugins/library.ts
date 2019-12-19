import { Engine } from '../../src/engine/next-gen-engine'
import { PluginManager } from '../../src/plugin/manager'
import { LibraryPlugin, LibraryApi } from '../../src/plugin/library'
import { pluginManagerProfile } from '@utils'

const createLib = () => ({
  events: {
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  mockMethod: jest.fn(),
  fakeMethod: jest.fn()
})

type Lib = ReturnType<typeof createLib>

const profile = {
  name: 'library',
  methods: ['mockMethod'],
  events: ['event'],
  notifications: {
    manager: ['profileUpdated']
  }
}

class MockLibrary extends LibraryPlugin {
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  call = jest.fn()
  on = jest.fn()
  off = jest.fn()
  emit = jest.fn()
  constructor(library: LibraryApi<any, any>) {
    super(library, profile)
  }
}

// Library without UI
describe('Iframe Plugin', () => {
  let manager: PluginManager
  let library: MockLibrary
  let lib: Lib

  beforeEach(async () => {
    lib = createLib()
    manager = new PluginManager(pluginManagerProfile)
    const engine = new Engine(manager)
    await engine.onload()
    library = new MockLibrary(lib)
    engine.register([ library ])
    manager.activatePlugin('sidePanel')
  })

  test('Activation', async () => {
    await library.activate()
    expect(library.onActivation).toHaveBeenCalled()
    // Listen on manager profileUpdated
    expect(library.on.mock.calls[0][0]).toEqual('manager')
    expect(library.on.mock.calls[0][1]).toEqual('profileUpdated')
    // Listen on events from library
    expect(lib.events.on.mock.calls[0][0]).toEqual('event')
  })

  test('Throw if library event does not match interface for notifications', async () => {
    try {
      library['library']['events'] = { notifications: {} } as any
      await library.activate()
    } catch (err) {
      expect(err.message).toEqual('"events" object from Library of plugin library should implement "emit"')
    }
  })

  test('Throw if library event does not match interface for events', async () => {
    try {
      library['library']['events'] = { events: {} } as any
      await library.activate()
    } catch (err) {
      expect(err.message).toEqual('"events" object from Library of plugin library should implement "emit"')
    }
  })

  test('Call library method', () => {
    library['callPluginMethod']('mockMethod', [true])
    expect(lib.mockMethod).toHaveBeenCalledWith(true)
  })

  test('Call library method not exposed should fail', () => {
    try {
      library['callPluginMethod']('fakeMethod', [true])
    } catch (err) {
      expect(err.message).toEqual("LibraryPlugin library doesn't expose method fakeMethod")
    }
  })

  test('Deactivation', async () => {
    library.deactivate()
    expect(library.onDeactivation).toHaveBeenCalled()
    // Stop listening on manager profileUpdated
    expect(library.off.mock.calls[0][0]).toEqual('manager')
    expect(library.off.mock.calls[0][1]).toEqual('profileUpdated')
    // Stop listening on events from library
    expect(lib.events.off.mock.calls[0][0]).toEqual('event')
  })
})