import { PluginClient } from '../../client'
import { listenEvent, callEvent, Message } from '../../utils'
import { connectSes, buildSesClient, Host } from '../index'

class MockSes implements Host {

  send = jest.fn()
  onMessage: (event: Partial<Message>) => void

  // Used to send a message to this instance
  sentFromIde(data: Partial<Message>) {
    console.log('data', data)
    this.onMessage(data)
  }

  on(cb: (event: Partial<Message>) => void) {
    console.log('START LISTENING')
    this.onMessage = cb
  }
}

const baseMsg: Partial<Message> = { name: 'name', key: 'key', id: 1 }

describe('Secure Ecmascript Client', () => {
  let client: PluginClient
  let host: MockSes

  // We use beforeAll so we don't have to wait for handshake each time
  beforeEach(async () => {
    global['host'] = new MockSes()
    host = global['host']
    client = new PluginClient()
    connectSes(client)
  })

  /**
   * @param index 0: response handshake or error / 2: response
   */
  function sendMockCall(index: number, param: number = 0) {
    return host.send.mock.calls[index][param]  // First result is always handshake
  }

  async function getMsgFromIDE(msg: Partial<Message>) {
    host.onMessage({ action: 'request', key: 'handshake', payload: ['pluginName'] })
    await client.onload()
    host.onMessage(msg)
  }

  test('Return error to parent if not loaded', () => {
    const msg: Partial<Message> = { ...baseMsg, action: 'notification' }
    host.sentFromIde(msg)
    expect(sendMockCall(0)).toEqual({ ...msg, error: 'Handshake before communicating'})
  })

  test('Load on handshake', () => {
    const msg: Partial<Message> = { action: 'request', key: 'handshake', payload: ['pluginName'] }
    host.sentFromIde(msg)
    expect(sendMockCall(0)).toEqual({ ...msg, action: 'response', payload: client.methods })
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
    expect(sendMockCall(1)).toEqual({ ...msg,  action: 'response', payload: false })
  })

  test('Request method from parent failed', async () => {
    const msg: Partial<Message> = { ...baseMsg, action: 'request' }
    await getMsgFromIDE(msg)
    expect(sendMockCall(1)).toEqual({ ...msg, error: `Method ${msg.key} doesn't exist on plugin ${msg.name}` })
  })

  // Request Info with one level path -> no change
  test('Request method from parent with requestInfo', async () => {
    const requestInfo = { path: 'remixd', from: 'external' }
    const msg: Partial<Message> = { ...baseMsg, action: 'request', payload: [true], requestInfo }
    client[msg.key] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendMockCall(1)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Request Info with two level path -> call service
  test('Request method from parent with service requestInfo', async () => {
    const requestInfo = { path: 'remixd.cmd', from: 'external' }
    const msg: Partial<Message> = { ...baseMsg, action: 'request', id: 1, payload: [true], requestInfo }
    client['cmd.key'] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendMockCall(1)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Request Info with two level path -> call service
  test('Request method from parent with subservice requestInfo', async () => {
    const requestInfo = { path: 'remixd.cmd.git', from: 'external' }
    const msg: Partial<Message> = {  ...baseMsg, action: 'request', payload: [true], requestInfo }
    client['cmd.git.key'] = (isTrue: boolean) => !isTrue
    await getMsgFromIDE(msg)
    expect(sendMockCall(1)).toEqual({ ...baseMsg, action: 'response', payload: false })
  })

  // Create Iframe
  test('Build an Iframe Plugin from extended PluginClient', () => {
    class Client extends PluginClient {}
    const sesClient = buildSesClient(new Client())
    expect(sesClient['fileManager']).toBeDefined()
    expect(sesClient['network']).toBeDefined()
    expect(sesClient['solidity']).toBeDefined()
    expect(sesClient['solidityUnitTesting']).toBeDefined()
    expect(sesClient['theme']).toBeDefined()
    expect(sesClient['udapp']).toBeDefined()
  })
})