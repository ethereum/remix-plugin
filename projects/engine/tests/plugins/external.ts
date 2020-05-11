import { transformUrl } from '../../src/plugin/external'

describe('transform Url', () => {
  test('use gateway for swarm', () => {
    expect(transformUrl({ url: 'swarm://url', name: 'my_name'})).toEqual('https://swarm-gateways.net/bzz-raw://url')
  })
  test('use gateway for ipfs', () => {
    expect(transformUrl({ url: 'ipfs://url', name: 'my_name'})).toEqual('https://my_name.dyn.plugin.remixproject.org/ipfs/url')
  })
  test('use normal if provided', () => {
    expect(transformUrl({ url: 'https://url', name: 'my_name' })).toEqual('https://url')
  })
})