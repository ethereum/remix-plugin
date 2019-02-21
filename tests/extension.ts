import { RemixExtension, Api } from '../src'
import { VyperCompiler } from '../examples/plugins'

const source = {
  postMessage(message: string, origin: string) {
    return { message, origin }
  }
}

const eventFromRemix = {
  source,
  origin: 'http://remix.ethereum.org',
} as any

const handshake = {
  ...eventFromRemix,
  data: JSON.stringify({
    action: 'request',
    key: 'handshake',
    payload: { theme: 'my-theme' }
  })
}

describe('Remix Extension Handshake', () => {
  let extension: RemixExtension<VyperCompiler>

  beforeEach(() => {
    extension = new RemixExtension<VyperCompiler>()
  })

  /*
  test('should throw when message origin is not remix', async (done) => {
    const spy = spyOn(extension, 'checkOrigin' as any)
    expect(spy).toReturnWith(false)
    await extension['getMessage']({source, origin: 'some-origin'} as any)
    done()
  })
  */

  test('Should trigger loaded on handshake', async (done) => {
    extension.loaded().then(({theme}) => {
      expect(theme).toBe('my-theme')
      done()
    })
    extension['getMessage'](handshake)
  })


})