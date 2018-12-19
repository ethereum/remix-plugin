import { Plugin, AppManager } from '../src'

const EthdocProfile = {
  type: 'ethdoc',
  methods: ['getDoc'],
  url: ''
}

describe('Plugin', () => {
  let app: AppManager
  let api: Plugin
  beforeAll(() => {
    api = new Plugin(EthdocProfile)
    app = new AppManager({
      plugins: [{ json: EthdocProfile, api }]
    })
    app.activate(api.type)
  })
  test('is added to app', () => expect(app[api.type]).toBeDefined())
  test('method is added to app', () => expect(app[api.type]['getDoc']).toBeDefined())
})
