import { transformUrl } from '../../src/plugin/external'

describe('transform Url', () => {
  test('use gateway for swarm', () => {
    expect(transformUrl('swarm://url', 'my_name')).toEqual('https://swarm-gateways.net/bzz-raw://url')
  })
  test('use gateway for ipfs', () => {
    expect(transformUrl('ipfs://url', 'my_name')).toEqual('https://my_name.dyn.plugin.remixproject.org/ipfs/url')
  })
  test('use normal if provided', () => {
    expect(transformUrl('https://url', 'my_name')).toEqual('https://url')
  })
})