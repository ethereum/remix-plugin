import { Engine, PluginManager, LibraryPlugin, LibraryApi } from '../src'
import { pluginManagerProfile } from '@remixproject/plugin-api'

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
  call: jest.Mock
  on: jest.Mock
  off: jest.Mock
  emit: jest.Mock
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  onActivation = jest.fn().mockImplementation(() => this.createMock())
  constructor(library: LibraryApi<any, any>) {
    super(library, profile)
  }
  createMock() {
    this.call = jest.fn()
    this.on = jest.fn()
    this.once = jest.fn()
    this.off = jest.fn()
    this.emit = jest.fn()
  }

}

// Library without UI
describe('Library Plugin', () => {
  let manager: PluginManager
  let library: MockLibrary
  let lib: Lib

  beforeEach(() => {
    lib = createLib()
    manager = new PluginManager(pluginManagerProfile)
    library = new MockLibrary(lib)
    const engine = new Engine()
    engine.register([ manager, library ])
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
    library.createMock() // Make sure methods are mocked
    library.deactivate()
    expect(library.onDeactivation).toHaveBeenCalled()
    // Stop listening on manager profileUpdated
    expect(library.off.mock.calls[0][0]).toEqual('manager')
    expect(library.off.mock.calls[0][1]).toEqual('profileUpdated')
    // Stop listening on events from library
    expect(lib.events.off.mock.calls[0][0]).toEqual('event')
  })
})