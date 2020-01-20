import { PluginClient, createApi, getApiMap, createIframeClient, listenOnThemeChanged } from '../index'
import { Api, ExternalProfile, CustomApi, callEvent, listenEvent, StatusEvents, Profile, LocationProfile } from '../../utils'

interface TestApi extends Api {
  events: {
    event: (isTrue: boolean) => void
  } & StatusEvents
  methods: {
    method: (isTrue: boolean) => boolean
  }
}

const profile: Profile<TestApi> & ExternalProfile & LocationProfile = {
  name: 'test',
  methods: ['method'],
  location: 'sidePanel',
  url: 'url'
}

describe('Client Api', () => {
  let client: PluginClient<TestApi, any>
  let api: CustomApi<TestApi>
  beforeEach(() => {
    client = new PluginClient()
    client['isLoaded'] = true
    api = createApi<TestApi>(client, profile)
  })

  test('Should create an Api', () => {
    expect(api).toBeDefined()
    expect(api.on).toBeDefined()
    expect(api.method).toBeDefined()
  })

  test('"Method" should send a message', done => {
    client.events.on('send', message => {
      expect(message).toEqual({
        action: 'request',
        name: 'test',
        key: 'method',
        payload: [true],
        id: 1,
      })
      done()
    })
    api.method(true)
  })

  test('"Method" should return a promise', done => {
    client.events.on('send', ({ name, key, id, payload }) => {
      client.events.emit(callEvent(name, key, id), payload[0])
    })
    api.method(true).then(isTrue => {
      expect(isTrue).toBeTruthy()
      done()
    })
  })

  test('"Event" should emit an event', done => {
    api.on('event', isTrue => {
      expect(isTrue).toBeTruthy()
      done()
    })
    client.events.emit(listenEvent('test', 'event'), true)
  })

  test('getApiMap returns a map of API', () => {
    const { test } = getApiMap(client, { test: profile })
    expect(test.on).toBeDefined()
    expect(test.method).toBeDefined()
  })

  test('createIframeClient has api', () => {
    const iframeClient = createIframeClient({customApi: { test: profile }})
    expect(iframeClient.test).toBeDefined()
    expect(iframeClient.test.on).toBeDefined()
    expect(iframeClient.test.method).toBeDefined()
  })
})

/////////////////
// COMMON APIS //
/////////////////
describe('Common Apis', () => {
  let client: PluginClient
  beforeEach(() => {
    client = new PluginClient()
  })
  test('Should listen on theme changed', async () => {
    const link = await listenOnThemeChanged(client) as HTMLLinkElement
    expect(link.getAttribute('rel')).toBe('stylesheet')
    client.events.emit('themeChanged', { url: 'url', quality: 'dark' })
    setTimeout(() => {
      expect(link.getAttribute('href')).toBe('url')
    }, 100)
  })
  test('If theme is custom, do not change the url', async () => {
    const options = { customTheme: true, customApi: { test: profile } }
    const link = await listenOnThemeChanged(client, options) as HTMLLinkElement
    client.events.emit('themeChanged', { url: 'url', quality: 'dark' })
    setTimeout(() => {
      expect(link.getAttribute('href')).toBeUndefined()
    }, 100)
  })
})
