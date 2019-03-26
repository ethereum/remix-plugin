import { AppManagerApi, IPermissionHandler, Api, PluginApi } from 'remix-plugin'
import { PermissionHandler } from './permission-handler'
import { PluginManager } from './modules'

export class IdeManager extends AppManagerApi {

  public permissionHandler: IPermissionHandler = new PermissionHandler()

  constructor(private pluginManager: PluginManager) {
    super()
  }

  getEntity<T extends Api>(name: string): PluginApi<T> {
    return this.pluginManager.getOne(name)
  }

  addEntity<T extends Api>(plugin: PluginApi<T>): void {
    this.pluginManager.addOne(plugin)
  }

  setActive(name: string, isActive: boolean): void {
    this.pluginManager.setActive(name, isActive)
  }
}
