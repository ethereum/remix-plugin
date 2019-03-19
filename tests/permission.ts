import { Plugin, PluginProfile, IPermissionProvider, IPermissionHandler, ModuleProfile } from "../src"
import { RemixAppManager, Store, PermissionModuleApi } from "../examples/modules"
import { Ethdoc } from "../examples/plugins"

class PermissionHandler implements IPermissionHandler, IPermissionProvider {
  responseToConfirm = { allow: true, remember: true }
  permissions = {}
  async askPermission(from: PluginProfile, to: ModuleProfile) {
    const { allow, remember } = await this.confirm(`Give permission for ${from.name} to call ${to.name}`)
    return allow
  }
  async confirm(message: string, options?: { from: PluginProfile, to: ModuleProfile }) {
    return this.responseToConfirm
  }

}

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  events: ['newDoc'],
  methods: ['getdoc'],
  notifications: {
    'solCompiler': ['getCompilationFinished']
  },
  hash: 'Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ',
  url: 'https://ipfs.io/ipfs/Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ/'
}

describe('Permissions', () => {
  let app: RemixAppManager
  let ethdoc: Plugin<Ethdoc>
  let permissionModule: PermissionModuleApi
  let permissionHandler: PermissionHandler
  beforeEach(() => {
    permissionHandler = new PermissionHandler()
    permissionModule = new PermissionModuleApi()
    ethdoc = new Plugin(EthdocProfile)
    app = new RemixAppManager(new Store(), permissionHandler)
    app.init([ethdoc, permissionModule.api()])
  })
  test('permission should be pristine', () => {
    expect(permissionHandler.permissions).toEqual({})
  })
  test('Permission Handler should return true', async () => {
    const allow = await app.permissionHandler.askPermission(ethdoc.profile, permissionModule.profile)
    expect(allow).toBe(true)
  })
  test('Permission should pass', async () => {
    const result = await ethdoc.request({ name: permissionModule.name, key: 'callWithPermission', payload: [] })
    expect(result).toBe(true)
  })
  test('Permission should not pass', async () => {
    permissionHandler.responseToConfirm = { allow: false, remember: true }
    try {
      await ethdoc.request({ name: permissionModule.name, key: 'callWithPermission', payload: [] })
    } catch (err) {
      expect(err.message).toBe(`${ethdoc.name} is not allowed to call ${permissionModule.name}.`)
    }
  })
})