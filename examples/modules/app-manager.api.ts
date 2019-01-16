import { AppManagerApi, Api, Entry } from '../../src'

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

  // Activate or deactivate a module or plugin
  public setActive(name: string, isActive: boolean) {
    isActive
      ? this.component.activate(name)
      : this.component.deactivate(name)
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

  public get<T extends Api>(name: string) {
    return this.state.entities[name] as Entry<T>
  }

  public activate(name: string) {
    if (this.state.entities[name].api['render']) {
      const view = this.state.entities[name].api['render']()
      document.body.appendChild(view)
    }
    this.state.actives.push(name)
  }

  public deactivate(name: string) {
    this.state.actives.splice(this.state.actives.indexOf(name))
  }
}