import { PluginManager } from '../../src/plugin/manager'
import { HostPlugin } from '../../src/plugin/host'
import { IframePlugin } from '../../src/plugin/iframe'
import { Engine } from '../../src/engine/next-gen-engine'
import { pluginManagerProfile } from '../../../utils'

class MockHost extends HostPlugin {
  isFocus = jest.fn() // (name: string) =>
  focus = jest.fn() // (name: string) =>
  addView = jest.fn() // (profile: Profile) =>
  removeView = jest.fn() // (name: string) =>
  constructor() {
    super({ name: 'sidePanel', methods: [] })
  }
}
class MockIframe extends IframePlugin {
  callMockEvent: (...payload: any[]) => any
  call = jest.fn(async () => true)
  on = jest.fn((name, method, cb) => this.callMockEvent = (...payload) => cb(...payload))
  off = jest.fn()
  once = jest.fn()
  constructor() {
    super({ name: 'iframe', location: 'sidePanel', methods: [], url: 'https://url' })
  }
}

describe('Iframe Plugin', () => {
  let manager: PluginManager
  let iframe: MockIframe
  let host: MockHost

  beforeEach(async () => {
    manager = new PluginManager(pluginManagerProfile)
    const engine = new Engine(manager)
    await engine.onload()
    iframe = new MockIframe()
    host = new MockHost()
    engine.register([iframe, host])
    manager.activatePlugin('sidePanel')
  })

  test('iframe is created', () => {
    expect(iframe['iframe']).toBeTruthy()
  })

  // ACTIVATION

  test('Activation set iframe element', async () => {
    await manager.activatePlugin('iframe')
    expect(iframe['iframe'].src).toEqual('https://url/')
  })

  // Didn't manage to test whatever happen after onload

  // test.only('Activation call handshake', async (done) => {
  //   const spy = spyOn(iframe, 'callPluginMethod' as any)
  //   iframe['iframe'].addEventListener('load', () => {
  //     expect(spy).toHaveBeenCalledWith('handshake')
  //     done()
  //   })
  //   await manager.activatePlugin('iframe')
  // })

  // METHODS

  test('callPluginMethod post message', async () => {
    const spy = spyOn(iframe, 'postMessage' as any)
    iframe['currentRequest'] = { from: 'manager' }
    iframe['callPluginMethod']('method', ['params'])
    const msg = { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'iframe', requestInfo: { from: 'manager' } }
    expect(spy).toHaveBeenCalledWith(msg)
  })

  test('callPluginMethod create pendingRequest', async (done) => {
    spyOn(iframe, 'postMessage' as any) // Mock postMessage cause iframe is not set yet
    iframe['callPluginMethod']('method', ['params'])
      .then((result) => {
        expect(result).toBeTruthy()
        done()
      })
    iframe['pendingRequest'][0](true, null)
  })

  test('callPluginMethod create pendingRequest', async (done) => {
    spyOn(iframe, 'postMessage' as any) // Mock postMessage cause iframe is not set yet
    iframe['callPluginMethod']('method', ['params'])
      .catch((err) => {
        expect(err).toBe('Error')
        done()
      })
    iframe['pendingRequest'][0](null, 'Error')
  })

  // Get Message: response
  test('getMessage with response should trigger pendingRequest', (done) => {
    spyOn(iframe, 'postMessage' as any) // Mock postMessage cause iframe is not set yet
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'response', key: 'method', payload: ['params'] }
    }
    iframe['callPluginMethod']('method', ['params']).then((result) => {
      expect(result).toEqual(['params'])
      done()
    })
    iframe['getMessage'](event as any)
  })

  // Get Message: request
  test('getMessage with request should call', () => {
    const spy = spyOn(iframe, 'postMessage' as any)
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'manager' }
    }
    iframe['getMessage'](event as any)
    expect(iframe.call).toHaveBeenCalledWith('manager', 'method', 'params')
    const response = { id: 0, action: 'response', key: 'method', payload: [true], name: 'manager', error: undefined }
    setTimeout(() => expect(spy).toHaveBeenCalledWith(response), 10)  // Wait for next tick
  })

  // Get Message: listen
  test('getMessage with listen should run "on"', () => {
    const spy = spyOn(iframe, 'postMessage' as any)
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'listen', key: 'method', payload: ['params'], name: 'manager' }
    }
    iframe['getMessage'](event as any)
    expect(iframe.on.mock.calls[0][0]).toEqual('manager')
    expect(iframe.on.mock.calls[0][1]).toEqual('method')
    iframe.callMockEvent(true)
    iframe.callMockEvent(true)
    iframe.callMockEvent(true)
    const response = { action: 'notification', key: 'method', payload: [true], name: 'manager' }
    expect(spy).toHaveBeenCalledWith(response)
    expect(spy).toHaveBeenCalledTimes(3)
  })

  // Get Message: once
  test('getMessage with once should run listen only one', () => {
    const spy = spyOn(iframe, 'postMessage' as any)
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'once', key: 'method', payload: ['params'], name: 'manager' }
    }
    iframe['getMessage'](event as any)
    expect(iframe.once.mock.calls[0][0]).toEqual('manager')
    expect(iframe.once.mock.calls[0][1]).toEqual('method')
  })

  // Get Message: off
  test('getMessage with once should run listen only one', () => {
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'off', key: 'method', payload: ['params'], name: 'manager' }
    }
    iframe['getMessage'](event as any)
    expect(iframe.off.mock.calls[0][0]).toEqual('manager')
  })
})