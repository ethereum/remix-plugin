import { Plugin } from '../src/lib/abstract'

const profile = { name: 'mock', methods: ['mockMethod', 'slowMockMethod', 'slowMockMethodTwo','failingMockMethod'] }

jest.setTimeout(10000)

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
  failingMockMethod = jest.fn(()=> {
    return new Promise((resolve, reject) => {
      reject('fail')
    })
  })
  slowMockMethod = jest.fn((num:number | undefined) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, num | 1000)
    })
  })
  slowMockMethodTwo = jest.fn((num:number | undefined) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, num | 1000)
    })
  })
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

  test('addRequest should timeout', async (done) => {
    plugin.setOptions({ queueTimeout: 10 })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', []).catch((err) => {
      expect(err).toBe('[TIMEOUT] Timeout for call slowMockMethod from fake')
      done()
    })
  });

  test('first addRequest should timeout, second one should succeed', async (done) => {
    plugin.setOptions({ queueTimeout: 10 })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', []).catch((err) => {
      expect(err).toBe('[TIMEOUT] Timeout for call slowMockMethod from fake')
      done()
    })
    plugin['addRequest']({ from: 'fake' }, 'mockMethod', []).then((x) => {
      expect(x).toBeTruthy()
    })
  });

  test('addRequest should be canceled', async () => {
    try {
      setTimeout(() => {
        plugin['cancelRequests']({ from: 'fake' }, 'slowMockMethod')
      }, 500)
      await plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', [])
    } catch (err) {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fake')
    }
  })

  test('addRequest should be canceled', async () => {
    try {
      setTimeout(() => {
        plugin['cancelRequests']({ from: 'fake' }, '')
      }, 500)
      await plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', [])
    } catch (err) {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fake')
    }
  })

  test('addRequest should be not canceled', async () => {
    setTimeout(() => {
      plugin['cancelRequests']({ from: 'fake' }, 'slowMockMethod')
    }, 500)
    const result = await plugin['addRequest']({ from: 'fake' }, 'slowMockMethodTwo', [])
    expect(result).toBeTruthy()
  })
  

  test('two simultaneously queued requests should return true', async (done) => {
    plugin['addRequest']({ from: 'fake' }, 'mockMethod', []).then((x) => {
      expect(x).toBeTruthy()
    })
    plugin['addRequest']({ from: 'fake' }, 'mockMethod', []).then((x) => {
      expect(x).toBeTruthy()
      done()
    })
  })

  test('two simultaneously queued requests should be canceled', async (done) => {
    setTimeout(() => {
      plugin['cancelRequests']({ from: 'fake' },'')
    }, 500)
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', []).catch((err) => {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fake')
    })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethodTwo', []).catch((err) => {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethodTwo from fake')
      done()
    })
  })

  test('3 simultaneously queued requestsm 2 should be canceled', async (done) => {
    setTimeout(() => {
      plugin['cancelRequests']({ from: 'fake' },'')
    }, 500)
    plugin['addRequest']({ from: 'fake2' }, 'slowMockMethodTwo', []).then((x) => {
      expect(x).toBeTruthy()
    })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', []).catch((err) => {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fake')
    })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethodTwo', []).catch((err) => {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethodTwo from fake')
      done()
    })
  })

  test('request should be rejected', async (done) => {
    plugin['addRequest']({ from: 'fake' }, 'failingMockMethod', []).catch((err) => {
      expect(err).toBe('fail')
      done()
    })
  })

  test('of two simultaneously queued requests 1 should return true other should be canceled', async (done) => {
    setTimeout(() => {
      plugin['cancelRequests']({ from: 'fake' }, 'slowMockMethod')
    }, 500)
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethod', []).catch((err) => {
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fake')
    })
    plugin['addRequest']({ from: 'fake' }, 'slowMockMethodTwo', []).then((x) => {
      expect(x).toBeTruthy()
      done()
    })
  })

})