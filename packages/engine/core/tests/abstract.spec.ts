import { Plugin } from '../src/lib/abstract'

const profile = { name: 'mock', methods: ['mockMethod'] }

class MockPlugin extends Plugin {
  mockRequest = jest.fn() // Needed because we delete the currentRequest key each time
  _currentRequest

  constructor(p) {
    super(p)
  }

  // @ts-ignore
  get currentRequest() {
    return this._currentRequest
  }
  set currentRequest(request) {
    this._currentRequest = request
    this.mockRequest(request)
  }

  mockMethod = jest.fn(() => true)
  onActivation = jest.fn()
  onDeactivation = jest.fn()
}



describe('Abstract Plugin', () => {
  let plugin: MockPlugin
  beforeEach(() => {
    plugin = new MockPlugin(profile)
  })

  test('Plugin has profile', () => {
    expect(plugin.profile).toEqual(profile)
    expect(plugin.name).toEqual(profile.name)
  })

  test('Activate trigger onActivation hook', () => {
    plugin.activate()
    expect(plugin.onActivation).toHaveBeenCalledTimes(1)
  })

  test('Deactivate trigger onActivation hook', () => {
    plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalledTimes(1)
  })

  test('Call Method should fail if method does not exist', () => {
    try {
      plugin['callPluginMethod']('fakeMethod', [])
    } catch (err) {
      expect(err.message).toBe('Method fakeMethod is not implemented by mock')
    }
  })

  test('Call Method should succeed if method exist', () => {
    const result = plugin['callPluginMethod']('mockMethod', [])
    expect(result).toBeTruthy()
  })

  test('addRequest should fail is method is not inside methods list', async () => {
    try {
      await plugin['addRequest']({ from: 'fake' }, 'fakeMethod', [])
    } catch (err) {
      expect(err.message).toBe('Method fakeMethod is not implemented by mock')
    }
  })

  test('addRequest should fail is method is not inside methods list', async () => {
    await Promise.all([
      plugin['addRequest']({ from: 'caller1' }, 'mockMethod', []),
      plugin['addRequest']({ from: 'caller2' }, 'mockMethod', []),
      plugin['addRequest']({ from: 'caller3' }, 'mockMethod', []),
    ])
    expect(plugin.mockRequest).toHaveBeenCalledTimes(3)
    expect(plugin.mockRequest.mock.calls[0][0]).toEqual({ from: 'caller1' })
    expect(plugin.mockRequest.mock.calls[1][0]).toEqual({ from: 'caller2' })
    expect(plugin.mockRequest.mock.calls[2][0]).toEqual({ from: 'caller3' })
  })
})