import { AppManagerApi, Api, PluginApi, IPermissionHandler } from '../../src'
import { PermissionHandlerWithAbstract } from '../permission/asbtract-class'

export class RemixAppManager extends AppManagerApi {
  public permissionHandler
  constructor(
    private store: Store,
    permissionHandler?: IPermissionHandler
  ) {
    super()
    this.permissionHandler = permissionHandler || new PermissionHandlerWithAbstract()
  }

  // Get the module from the component state
  public getEntity<T extends Api>(id: string): PluginApi<T> {
    return this.store.get<T>(id)
  }

  // Add the module to the component state
  public addEntity<T extends Api>(entry: PluginApi<T>) {
    this.store.add(entry)
  }

  // Activate or deactivate a module or plugin
  public setActive(name: string, isActive: boolean) {
    isActive
      ? this.store.activate(name)
      : this.store.deactivate(name)
  }

}


// The store of the state of the AppManager
export class Store {

  public state: {
    ids: string[],
    actives: string[],
    entities: {
      [id: string]: PluginApi<any>
    }
  } = {
    ids: [],
    actives: [],
    entities: {}
  }

  public add<T extends Api>(api: PluginApi<T>) {
    this.state.ids.push(api.name)
    this.state.entities[api.name] = api
  }

  public get<T extends Api>(name: string) {
    return this.state.entities[name] as PluginApi<T>
  }

  public activate(name: string) {
    this.state.actives.push(name)
  }

  public deactivate(name: string) {
    this.state.actives.splice(this.state.actives.indexOf(name))
  }
}