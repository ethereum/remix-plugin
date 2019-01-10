import { AppManagerApi, Api, Entry, ModuleProfile } from '../../src'

export class RemixAppManager extends AppManagerApi {

  constructor(private component: PluginManagerComponent) {
    super()
  }

  // Get the module from the component state
  public getEntity<T extends Api>(id: string): Entry<T> {
    return this.component.get<T>(id)
  }

  // Add the module to the component state
  public addEntity<T extends Api>(entry: Entry<T>) {
    this.component.add(entry)
  }

}


// Component used to display some content to the user
export class PluginManagerComponent {

  public state: {
    ids: string[],
    actives: string[],
    entities: {
      [id: string]: Entry<any>
    }
  } = {
    ids: [],
    actives: [],
    entities: {}
  }

  public add<T extends Api>({profile, api}: Entry<T>) {
    this.state.ids.push(profile.name)
    this.state.entities[profile.name] = {profile, api} as Entry<T>
  }

  public get<T extends Api>(id: string) {
    return this.state.entities[id] as Entry<T>
  }
}