import { PluginManager, Engine, HostPlugin, ViewPlugin, Profile } from '@remixproject/engine'

// Host plugin display
export class SidePanel extends HostPlugin {
  plugins: Record<string, HTMLElement> = {}
  focused: string
  root: Element // The root html element of the HostPlugin
  constructor(root = document.body) {
    // The 4 abstract methods are exposed by default by the HostPlugin
    super({ name: 'sidePanel' })
    this.root = root
  }
  // Add a View plugin into the DOM once it's activated
  addView(profile: Profile, view: HTMLElement) {
    this.plugins[profile.name] = view
    view.style.display = 'none'
    this.root.appendChild(view)
  }
  // Remove a View plugin from the DOM once it's deactivated
  removeView(profile: Profile) {
    this.root.removeChild(this.plugins[profile.name])
    if (this.focused === profile.name) delete this.focused
    delete this.plugins[profile.name]
  }
  // Set focus on one plugin
  focus(name: string) {
    if (this.plugins[name]) {
      if (this.plugins[this.focused]) this.plugins[this.focused].style.display = 'none'
      this.plugins[name].style.display = 'block'
      this.focused = name
      this.emit('focused', name)
    }
  }

  // Check if a plugin is focus
  isFocus(name: string) {
    return name === this.focused
  }
}

// View Plugin
class HostedPlugin extends ViewPlugin {
  root: HTMLElement
  constructor() {
    // Specific the location where this plugin is hosted
    super({ name: 'hosted', location: 'sidePanel' })
  }
  // Render the element into the host plugin
  render(): Element {
    if (!this.root) {
      this.root = document.createElement('div')
    }
    return this.root
  }
}


test('[Example] Hosted Plugin', async () => {

  ///////////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const sidePanel = new SidePanel()
  const hosted = new HostedPlugin()

  // wait for the manager to be loaded
  await engine.onload()

  // Register both plugins
  engine.register([sidePanel, hosted])

  // Activate both plugins
  // Note that order is important here !
  await manager.activatePlugin(['sidePanel', 'hosted'])
  sidePanel.focus('hosted')

  ///////////////////////////////////

  expect(hosted.root).toBeDefined()
  expect(sidePanel.plugins['hosted']).toEqual(hosted.root)
  expect(sidePanel.focused).toEqual('hosted')

  ///////////////////////////////////

  await manager.deactivatePlugin('hosted')

  ///////////////////////////////////
  expect(sidePanel.plugins['hosted']).toBeUndefined()
  expect(sidePanel.focused).toBeUndefined()
})