import { PermissionHandler } from '@examples/permission/simple-permission'
import { FileManager, Solidity } from '@examples/native-plugins'
import { Plugin } from '../src/plugin'
import { PluginEngine, PluginMap } from '../src/engine'


// A Not Native plugin only for testing purpose
export class NotNative extends Plugin {
  constructor() {
    super({ name: 'notNative', methods: [], url: 'url'} as any)
  }
}


describe('Permissions', () => {
  let engine: PluginEngine<any>
  let notNative: NotNative
  let solidity: Solidity
  let fileManager: FileManager
  let permissionHandler: PermissionHandler

  beforeEach(() => {
    permissionHandler = new PermissionHandler()
    notNative = new NotNative()
    solidity = new Solidity()
    fileManager = new FileManager()
    fileManager.setFile('file.sol', 'My file')
    engine = new PluginEngine<any>({ notNative, fileManager, solidity }, {permissionHandler})
    engine.activate(['fileManager', 'solidity', 'notNative'])
  })
  test('permission should be pristine', () => {
    expect(permissionHandler.permissions).toEqual({})
  })
  test('Permission between native should pass', async () => {
    fileManager.setFile('file.sol', 'file')
    const spy = spyOn(permissionHandler, 'askPermission')
    const file = await solidity.call('fileManager', 'getFile', 'file.sol')
    expect(file).toEqual('file')
    expect(spy).not.toBeCalled()
  })
  test('Permission should pass with permission', async () => {
    fileManager.setFile('file.sol', 'file')
    const file = await notNative.call('fileManager', 'getFile', 'file.sol')
    expect(file).toEqual('file')
  })
  test('Permission should not pass', () => {
    permissionHandler.responseToConfirm = { allow: false, remember: true }
    notNative.call('fileManager', 'getFile', 'file.sol')
      .catch(err => expect(err.message)
        .toEqual(`Plugin "notNative" don't have permission to call method "getFile" of plugin "fileManager"`))
  })
})