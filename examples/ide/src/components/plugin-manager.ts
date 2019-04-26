import { LitElement, customElement, html } from 'lit-element'
import { pluginManager } from '../modules'

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
    const { actives, inactives } = pluginManager
      .getAll(({ profile }) => !profile.required)
      .reduce((acc, plugin) => {
        const isActive = pluginManager.isActive(plugin.name)
        const _actives = isActive ? [ ...acc.actives, pluginItem(plugin, true) ] : acc.actives
        const _inactives = !isActive ? [ ...acc.inactives, pluginItem(plugin, false) ] : acc.inactives
        return { actives: _actives, inactives: _inactives }
      }, {actives: [], inactives: []})


    return html`
      <ul>
        ${inactives} ${actives}
      </ul>
    `
  }
}
