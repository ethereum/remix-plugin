import {
  createApi,
  ModuleProfile,
  PluginClient,
  CustomApi,
  Api,
  callEvent,
  listenEvent,
  getApiMap,
  Theme,
  listenOnThemeChanged,
} from '../../src'

interface TestApi extends Api {
  name: 'test'
  events: {
    event: (isTrue: boolean) => void
  }
  methods: {
    method: (isTrue: boolean) => boolean
  }
}

const profile: ModuleProfile<TestApi> = {
  name: 'test',
  methods: ['method'],
  events: ['event'],
}

describe('Client Api', () => {
  let client: PluginClient
  let api: CustomApi<TestApi>
  beforeEach(() => {
    client = new PluginClient()
    client['loaded'] = true
    api = createApi(client, profile)
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
    const { test } = getApiMap(client, [profile])
    expect(test.on).toBeDefined()
    expect(test.method).toBeDefined()
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
  test('Should listen on theme changed', () => {
    const link = listenOnThemeChanged(client) as HTMLLinkElement
    expect(link.getAttribute('rel')).toBe('stylesheet')
    client.events.emit('themeChanged', { url: 'url', quality: 'dark' })
    setTimeout(() => {
      expect(link.getAttribute('href')).toBe('url')
    }, 100)
  })
  test('If theme is custom, do not change the url', () => {
    const options = { customTheme: true }
    const link = listenOnThemeChanged(client, options) as HTMLLinkElement
    client.events.emit('themeChanged', { url: 'url', quality: 'dark' })
    setTimeout(() => {
      expect(link.getAttribute('href')).toBeUndefined()
    }, 100)
  })
})
