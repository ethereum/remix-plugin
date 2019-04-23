import { LitElement, customElement, html } from 'lit-element'
import { pluginManager } from '../modules'
import { PluginApi, PluginProfile, ModuleProfile } from 'remix-plugin'

function isPlugin(profile: PluginProfile | ModuleProfile): profile is PluginProfile {
  return !!profile['url']
}

@customElement('plugin-viewer')
export class PluginViewer extends LitElement {

  private activated: PluginProfile

  constructor() {
    super()
    pluginManager.events.on('activated', (name) => {
      const {profile} = pluginManager.getOne(name)
      if (!profile || !isPlugin(profile)) return
      this.activated = profile
      this.requestUpdate()
    })
    pluginManager.events.on('deactivated', () => this.requestUpdate())
  }

  render() {
    if (this.activated) {
      const src = this.activated.url
      return html`<iframe src="${src}"></iframe>`
    }
  }
}