import { Plugin, AppManager } from '../src'
import { EthdocProfile } from './../examples/plugins/ethdoc'


describe('Plugin', () => {
  let app: AppManager
  let api: Plugin
  beforeAll(() => {
    api = new Plugin(EthdocProfile)
    app = new AppManager({
      plugins: [{ json: EthdocProfile, api }]
    })
  })
  test('is added to app', () => expect(app[api.type]).toBeDefined())
  test('method is added to app', () => expect(app[api.type]['getDoc']).toBeDefined())
})
