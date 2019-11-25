import { getMethodPath } from '../src/method-path'

describe('Get Method Path', () => {
  test('call event', () => {
    expect(getMethodPath('call')).toEqual('call')
    expect(getMethodPath('call', '')).toEqual('call')
    expect(getMethodPath('call', 'remixd')).toEqual('call')
    expect(getMethodPath('call', 'remixd.cmd')).toEqual('cmd.call')
    expect(getMethodPath('call', 'remixd.cmd.git')).toEqual('cmd.git.call')
  })

})
