import { checkOrigin, PluginClient, connectIframe, listenEvent, callEvent  } from 'remix-plugin'

function createEvent(data, postMessage?) {
  return {
    origin: 'http://remix.ethereum.org',
    source: {
      postMessage
    },
    data
  }
}

describe('Iframe', () => {
  let sendMessage: (event) => void
  let client: PluginClient

  test('Check origin', () => {
    const devMode = { port: 8080 }
    const goodOrigin = 'http://remix.ethereum.org'
    const wrongOrigin = 'http://remix.ethereum.com'
    const goodLocalOrigin = `http://127.0.0.1:${devMode.port}`
    const wrongLocalOrigin = `http://localhost:${devMode.port + 1}`

    expect(checkOrigin(goodOrigin)).toBeTruthy()
    expect(checkOrigin(wrongOrigin)).toBeFalsy()
    expect(checkOrigin(goodLocalOrigin, devMode)).toBeTruthy()
    expect(checkOrigin(wrongLocalOrigin, devMode)).toBeFalsy()
  })

  // We use beforeAll so we don't have to wait for handshake each time
  beforeAll(() => {
    window.addEventListener = (event, cb) => sendMessage = cb
    client = new PluginClient()
    connectIframe(client)
  })

  // test('Should throw when no source', () => {
  //   expect(() => sendMessage({})).toThrow('No Source')
  // })

  test('Return error to parent if not loaded', (done) => {
    const msg = { action: 'notification', name: 'name', key: 'key', id: 1 }
    const errorMessage = (message) => {
      expect(message).toEqual({ ...msg, error: 'Handshake before communicating'})
      done()
    }
    const event = createEvent(msg, errorMessage)
    sendMessage(event)
  })

  test('Load on handshake', (done) => {
    const message = { action: 'request', key: 'handshake' }
    client.events.on('loaded', () => {
      expect(true).toBeTruthy()
      done()
    })
    sendMessage(createEvent(message))
  })

  test('Send notification', (done) => {
    const msg = { action: 'notification', name: 'name', key: 'key', payload: [true] }
    client.events.on(listenEvent(msg.name, msg.key), (payload) => {
      expect(payload).toBeTruthy()
      done()
    })
    sendMessage(createEvent(msg))
  })

  test('Send response with payload', (done) => {
    const msg = { action: 'response', name: 'name', key: 'key', id: 1, payload: [true] }
    const listener = (payload) => {
      expect(payload).toBeTruthy()
      client.events.removeListener(callEvent(msg.name, msg.key, msg.id), listener)
      done()
    }
    client.events.on(callEvent(msg.name, msg.key, msg.id), listener)
    sendMessage(createEvent(msg))
  })

  test('Send response with error', (done) => {
    const msg = { action: 'response', name: 'name', key: 'key', id: 1, error: 'error' }
    const listener = (payload, err) => {
      expect(payload).toBeUndefined()
      expect(err).toBe(msg.error)
      client.events.removeListener(callEvent(msg.name, msg.key, msg.id), listener)
      done()
    }
    client.events.on(callEvent(msg.name, msg.key, msg.id), listener)
    sendMessage(createEvent(msg))
  })

  test('Request method from parent succeed', (done) => {
    const msg = { action: 'request', name: 'name', key: 'key', id: 1, payload: [true] }
    client[msg.key] = (isTrue: boolean) => !isTrue
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({ ...msg,  action: 'response', payload: false })
      done()
    })
    sendMessage(event)
  })

  test('Request method from parent failed', (done) => {
    const msg = { action: 'request', name: 'name', key: 'key', id: 1 }
    delete client[msg.key]  // Need to delete because we use beforeAll
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({
        ...msg,
        error: `Method ${msg.key} doesn't exist on plugin ${msg.name}`
      })
      done()
    })
    sendMessage(event)
  })

})