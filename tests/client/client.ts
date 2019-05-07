import { handleConnectionError, PluginClient, defaultOptions, callEvent, listenEvent } from '../../src'


// Handle Error
test('Handle Connection Error', () => {
  const devMode = { port:  8080}
  expect(() => handleConnectionError(devMode))
    .toThrow(`Make sure the port of the IDE is ${devMode.port}`)
  expect(() => handleConnectionError())
    .toThrow('If you are using a local IDE, make sure to add devMode in client options')
})


// Before Loaded
describe('Client is not loaded yet', () => {
  let client: PluginClient

  beforeEach(() => {
    client = new PluginClient()
  })

  test('Client has default values', () => {
    expect(client).toBeDefined()
    expect(client['loaded']).toBeFalsy()
    expect(client['id']).toBe(0)
  })

  test('Client should load with callback', (done) => {
    client.onload(() => {
      expect(true).toBeTruthy()
      done()
    })
    client.events.emit('loaded')
  })

  test('Client should load with promise', (done) => {
    client.onload().then(() => {
      expect(true).toBeTruthy()
      done()
    })
    client.events.emit('loaded')
  })

  test('Call should throw when client is not loaded', async () => {
    expect(() => client.call('name', 'key'))
      .toThrow('If you are using a local IDE, make sure to add devMode in client options')
  })
})


// After Loaded
describe('Client is loaded', () => {
  let client: PluginClient
  beforeEach(async () => {
    client = new PluginClient()
    client.events.emit('loaded')
    await client.onload()
  })

  // CALL

  test('"Call" should trigger a send event', async (done) => {
    const name = 'name', key = 'key', payload = 'payload'
    client.events.on('send', (msg) => {
      expect(msg).toEqual({ action: 'request', name, key, payload: [payload], id: 1 })
      done()
    })
    client.call(name, key, payload)
  })

  test('Call should wait for a response', async (done) => {
    const name = 'name', key = 'key', payload = 'payload'
    client.call(name, key, payload).then((result) => {
      expect(result).toBeTruthy()
      done()
    })
    client.events.emit(callEvent(name, key, 1), true)
  })

  test('Call should throw an error', (done) => {
    const name = 'name', key = 'key', payload = 'payload'
    client.call(name, key, payload).catch((error) => {
      expect(error.message).toBe('Error from IDE : error')
      done()
    })
    client.events.emit(callEvent(name, key, 1), undefined, 'error')
  })

  // ON

  test('"On" should listen for event', (done) => {
    const name = 'name', key = 'key', payload = 'payload'
    client.on(name, key, (result) => {
      expect(result).toEqual(payload)
      done()
    })
    client.events.emit(listenEvent(name, key), payload)
  })

  // EMIT

  test('"Emit" should trigger an "send" event', (done) => {
    const key = 'key', payload = 'payload'
    client.events.on('send', (result) => {
      expect(result).toEqual({ action: 'notification', key, payload: [payload] })
      done()
    })
    client.emit(key, payload)
  })

})