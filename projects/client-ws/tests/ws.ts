import { PluginClient } from '../../client'
import { connectWS, WS, WSData, buildWebsocketClient } from '../index'
import { listenEvent, callEvent, Message } from '../../utils'

// import WS from "jest-websocket-mock"

function createEvent(data, postMessage?) {
  return {
    origin: 'http://remix.ethereum.org',
    source: {
      postMessage
    },
    data
  }
}

class MockWS implements WS {

  send = jest.fn((data: string) => JSON.parse(data))
  onMessage: (event: WSData) => void

  // Used to send a message this instance
  sentFromIde(data: Partial<Message>) {
    const message = { toString: () => JSON.stringify(data) }
    this.onMessage(message)
  }

  on(type: "message", cb: (event: WSData) => void) {
    this.onMessage = cb
    return this
  }
}

const baseMsg: Partial<Message> = { name: 'name', key: 'key', id: 1 }

describe('Websocket Client', () => {
  let client: PluginClient
  let ws: MockWS

  // We use beforeAll so we don't have to wait for handshake each time
  beforeEach(async () => {
    ws = new MockWS()
    client = new PluginClient()
    connectWS(ws, client)
  })

  /**
   * @param index 0: send handshake / 1: response handshake or error / 2: response
   */
  function sendResponse(index: number) {
    return ws.send.mock.results[index].value  // First result is always handshake
  }

  function toMsgEvent(msg: Partial<Message>) {
    return { toString: () => JSON.stringify(msg) }
  }

  async function getMsgFromIDE(msg: Partial<Message>) {
    ws.onMessage(toMsgEvent({ action: 'request', key: 'handshake', payload: ['pluginName'] }))
    await client.onload()
    ws.onMessage(toMsgEvent(msg))
  }

  test('Return error to parent if not loaded', () => {
    const msg: Partial<Message> = { ...baseMsg, action: 'notification' }
    ws.sentFromIde(msg)
    expect(sendResponse(1)).toEqual({ ...msg, error: 'Handshake before communicating'})
  })

  test('Load on handshake', () => {
    const msg: Partial<Message> = { action: 'request', key: 'handshake', payload: ['pluginName'] }
    ws.sentFromIde(msg)
    expect(sendResponse(1)).toEqual({ ...msg, action: 'response', payload: client.methods })
    expect(client.isLoaded).toBeTruthy()
    expect(client.name).toBe('pluginName')
  })

  test('Get notification', async (done) => {
    const msg: Partial<Message> = { ...baseMsg, action: 'notification', payload: [true] }
    client.events.on(listenEvent(msg.name, msg.key), (payload) => {
      expect(payload).toBeTruthy()
      done()
    })
    getMsgFromIDE(msg)
  })

  test('Send response with payload', async (done) => {
    const msg: Partial<Message> = { ...baseMsg, action: 'response', payload: [true] }
    const event = callEvent(msg.name, msg.key, msg.id)
    const listener = (payload) => {
      expect(payload).toBeTruthy()
      client.events.removeListener(event, listener)
      done()
    }
    client.events.on(event, listener)
    getMsgFromIDE(msg)
  })

  test('Get response with error', async (done) => {
    const msg: Partial<Message> = { ...baseMsg, action: 'response', error: 'error' }
    const listener = (payload, err) => {
      expect(payload).toBeUndefined()
      expect(err).toBe(msg.error)
      client.events.removeListener(callEvent(msg.name, msg.key, msg.id), listener)
      done()
    }
    client.events.on(callEvent(msg.name, msg.key, msg.id), listener)
    getMsgFromIDE(msg)
  })

  test('Request method from parent succeed', async () => {
    const msg: Partial<Message> = { ...baseMsg, action: 'request', payload: [true] }
    client[msg.key] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendResponse(2)).toEqual({ ...msg,  action: 'response', payload: false })
  })

  test('Request method from parent failed', async () => {
    const msg: Partial<Message> = { ...baseMsg, action: 'request' }
    await getMsgFromIDE(msg)
    expect(sendResponse(2)).toEqual({ ...msg, error: `Method ${msg.key} doesn't exist on plugin ${msg.name}` })
  })

  // Request Info with one level path -> no change
  test('Request method from parent with requestInfo', async () => {
    const requestInfo = { path: 'remixd', from: 'external' }
    const msg: Partial<Message> = { ...baseMsg, action: 'request', payload: [true], requestInfo }
    client[msg.key] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendResponse(2)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Request Info with two level path -> call service
  test('Request method from parent with service requestInfo', async () => {
    const requestInfo = { path: 'remixd.cmd', from: 'external' }
    const msg: Partial<Message> = { ...baseMsg, action: 'request', id: 1, payload: [true], requestInfo }
    client['cmd.key'] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendResponse(2)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Request Info with two level path -> call service
  test('Request method from parent with subservice requestInfo', async () => {
    const requestInfo = { path: 'remixd.cmd.git', from: 'external' }
    const msg: Partial<Message> = {  ...baseMsg, action: 'request', payload: [true], requestInfo }
    client['cmd.git.key'] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendResponse(2)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Create Iframe
  test('Build an Iframe Plugin from extended PluginClient', () => {
    class Client extends PluginClient {}
    const wsClient = buildWebsocketClient(ws, new Client())
    expect(wsClient['fileManager']).toBeDefined()
    expect(wsClient['network']).toBeDefined()
    expect(wsClient['solidity']).toBeDefined()
    expect(wsClient['solidityUnitTesting']).toBeDefined()
    expect(wsClient['theme']).toBeDefined()
    expect(wsClient['udapp']).toBeDefined()
  })
})