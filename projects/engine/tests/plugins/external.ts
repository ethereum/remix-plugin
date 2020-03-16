import { transformUrl } from '../../src/plugin/external'

describe('transform Url', () => {
  test('use gateway for swarm', () => {
    expect(transformUrl('swarm://url')).toEqual('https://swarm-gateways.net/bzz-raw://url')
  })
  test('use gateway for ipfs', () => {
    expect(transformUrl('ipfs://url')).toEqual('https://ipfsgw.komputing.org/ipfs/url')
  })
  test('use normal if provided', () => {
    expect(transformUrl('https://url')).toEqual('https://url')
  })
})