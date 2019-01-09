import { AppManagerApi, Api, ModuleEntry, ModuleProfile } from '../../src'

export class RemixAppManager extends AppManagerApi {

  constructor(private component: PluginManagerComponent) {
    super()
  }

  // Get the module from the component state
  public getEntity<T extends Api>(id: string): ModuleEntry<T> {
    return this.component.get<T>(id)
  }

  // Add the module to the component state
  public addEntity<T extends Api>(entry: ModuleEntry<T>) {
    this.component.add(entry)
  }

}


// Component used to display some content to the user
export class PluginManagerComponent {

  public state: {
    ids: string[],
    actives: string[],
    entities: ModuleEntry<any>[]
  }

  public add<T extends Api>(entity: ModuleEntry<T>) {
    this.state.ids.push(entity.profile.type)
    this.state.entities.push(entity)
  }

  public get<T extends Api>(id: string) {
    return this.state.entities[id] as ModuleEntry<T>
  }
}