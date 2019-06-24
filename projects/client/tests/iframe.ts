import { checkOrigin, PluginClient, connectIframe } from '@remixproject/plugin'
import { listenEvent, callEvent } from '@utils'

declare const global  // Needed to mock fetch

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

  test('Check origin', async () => {
    const port = 8080
    const origins = 'package://'
    const goodOrigin = 'http://remix.ethereum.org'
    const wrongOrigin = 'http://remix.ethereum.com'
    const goodLocalOrigin = `http://127.0.0.1:${port}`
    const wrongLocalOrigin = `http://localhost:${port + 1}`
    const wrongExternalOrigin = `${origins}wrong`
    const goodExternalOrigin = origins

    // Mock fetch api
    const mockFetchPromise = Promise.resolve({
      json: () => Promise.resolve([
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org"
      ])
    })
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise)

    expect(await checkOrigin(goodOrigin)).toBeTruthy()
    expect(await checkOrigin(wrongOrigin)).toBeFalsy()
    expect(await checkOrigin(goodLocalOrigin, { port })).toBeTruthy()
    expect(await checkOrigin(wrongLocalOrigin, { port })).toBeFalsy()
    expect(await checkOrigin(goodExternalOrigin, { origins })).toBeTruthy()
    expect(await checkOrigin(wrongExternalOrigin, { origins })).toBeFalsy()
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