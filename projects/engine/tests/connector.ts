describe.skip('', () => {
  // // Get Message: request
  // test('[request] shoud trigger "call"', () => {
  //   const spy = spyOn(iframe, 'send' as any)
  //   iframe['origin'] = 'url'
  //   const event = {
  //     origin: 'url',
  //     data: { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'manager' }
  //   }
  //   iframe['getEvent'](event as any)
  //   expect(iframe['getMessage']).toHaveBeenCalledWith({ id: 0, action: 'request', key: 'method', payload: ['params'], name: 'manager' })
  //   const response = { id: 0, action: 'response', key: 'method', payload: [true], name: 'manager', error: undefined }
  //   setTimeout(() => expect(spy).toHaveBeenCalledWith(response), 10)  // Wait for next tick
  // })

  // // Get Message: listen
  // test('getEvent with listen should run "on"', () => {
  //   const spy = spyOn(iframe, 'send' as any)
  //   iframe['origin'] = 'url'
  //   const event = {
  //     origin: 'url',
  //     data: { id: 0, action: 'listen', key: 'method', payload: ['params'], name: 'manager' }
  //   }
  //   iframe['getEvent'](event as any)
  //   expect(iframe.on.mock.calls[0][0]).toEqual('manager')
  //   expect(iframe.on.mock.calls[0][1]).toEqual('method')
  //   iframe.callMockEvent(true)
  //   iframe.callMockEvent(true)
  //   iframe.callMockEvent(true)
  //   const response = { action: 'notification', key: 'method', payload: [true], name: 'manager' }
  //   expect(spy).toHaveBeenCalledWith(response)
  //   expect(spy).toHaveBeenCalledTimes(3)
  // })

  // // Get Message: once
  // test('getEvent with once should run listen only one', () => {
  //   const spy = spyOn(iframe, 'send' as any)
  //   iframe['origin'] = 'url'
  //   const event = {
  //     origin: 'url',
  //     data: { id: 0, action: 'once', key: 'method', payload: ['params'], name: 'manager' }
  //   }
  //   iframe['getEvent'](event as any)
  //   expect(iframe.once.mock.calls[0][0]).toEqual('manager')
  //   expect(iframe.once.mock.calls[0][1]).toEqual('method')
  // })

  // // Get Message: off
  // test('getEvent with once should run listen only one', () => {
  //   iframe['origin'] = 'url'
  //   const event = {
  //     origin: 'url',
  //     data: { id: 0, action: 'off', key: 'method', payload: ['params'], name: 'manager' }
  //   }
  //   iframe['getEvent'](event as any)
  //   expect(iframe.off.mock.calls[0][0]).toEqual('manager')
  // })
})