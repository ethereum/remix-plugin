import { RemixExtension } from './../../src/client'

test('Remix Extension', () => {
    const extension = new RemixExtension()
    expect(!!extension).toBe(true)
})