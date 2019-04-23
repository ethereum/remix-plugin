import { LitElement, customElement, html } from "lit-element";
import { pluginManager } from "../modules";

@customElement('plugin-manager')
export class PluginManagerComponent extends LitElement {

  constructor() {
    super()
    pluginManager.events.on('added', () => this.requestUpdate())
    pluginManager.events.on('activated', () => this.requestUpdate())
    pluginManager.events.on('deactivated', () => this.requestUpdate())
  }

  private activate(name: string, isActive: boolean) {
    pluginManager.setActive(name, isActive)
  }

  render() {
    const pluginItem = (plugin, isActive: boolean) => html`
      <li>
        <span>${plugin.name}<span>
        <button @click="${() => this.activate(plugin.name, !isActive)}">
          ${isActive ? 'Deactivate' : 'Activate'}
        </button>
      </li>
    `
    const pluginList = pluginManager
      .getAll()
      .filter(({profile}) => !profile.required)
    const actives = pluginList
      .filter(({name}) => pluginManager.isActive(name))
      .map(p => pluginItem(p, true))
    const inactives = pluginList
      .filter(({name}) => !pluginManager.isActive(name))
      .map(p => pluginItem(p, false))

    return html`<ul>
      ${inactives}
      ${actives}
    </ul>`
  }

}