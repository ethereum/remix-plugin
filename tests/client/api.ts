import { createApi, ModuleProfile, PluginClient, CustomApi, Api } from '../../src'

interface TestApi extends Api {
  name: 'test',
  events: {
    event: (isTrue: boolean) => void
  }
  method: (isTrue: boolean) => boolean
}

const profile: ModuleProfile<TestApi> = {
  name: 'test',
  methods: ['method'],
  events: ['event']
}

describe('Client Api', () => {
  let client: PluginClient
  let api: CustomApi<TestApi>
  beforeEach(() => {
    client = new PluginClient()
    api = createApi(client, profile)
  })

  test('Should create an Api', () => {
    expect(api).toBeDefined()
    expect(api.event).toBeDefined()
    expect(api.method).toBeDefined()
  })

  test('Method should be a promise', (done) => {
    api.method
  })
})