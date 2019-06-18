import 'jest'
import { callEvent, listenEvent } from '@utils'

describe('Event names', () => {
  test('call event', () => {
    expect(callEvent('solidity', 'compile', 2)).toEqual('[solidity] compile-2')
    expect(callEvent('fs', 'setFile', '1' as any)).toEqual('[fs] setFile-1')
  })
  test('listen event', () => {
    expect(listenEvent('solidity', 'onCompilationFinished')).toEqual('[solidity] onCompilationFinished')
  })
})
