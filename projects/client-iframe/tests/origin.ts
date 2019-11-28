import { checkOrigin } from "../src/origin"

declare const global  // Needed to mock fetch

describe('Origin', () => {
  test('Check origin', async () => {
    const port = 8080
    const origins = 'package://'
    const goodOrigin = 'http://remix.ethereum.org'
    const wrongOrigin = 'http://remix.ethereum.com'
    const goodLocalOrigin = `http://127.0.0.1:${port}`
    const wrongLocalOrigin = `http://localhost:${port + 1}`
    const wrongExternalOrigin = `${origins}wrong`
    const goodExternalOrigin = origins

    // Mock fetch api
    const mockFetchPromise = Promise.resolve({
      json: () => Promise.resolve([
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org"
      ])
    })
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise)

    expect(await checkOrigin(goodOrigin)).toBeTruthy()
    expect(await checkOrigin(wrongOrigin)).toBeFalsy()
    expect(await checkOrigin(goodLocalOrigin, { port })).toBeTruthy()
    expect(await checkOrigin(wrongLocalOrigin, { port })).toBeFalsy()
    expect(await checkOrigin(goodExternalOrigin, { origins })).toBeTruthy()
    expect(await checkOrigin(wrongExternalOrigin, { origins })).toBeFalsy()
  })
})