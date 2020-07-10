import { ViewPlugin } from '../../src/plugin/view'
import { PluginManager } from '../../src/plugin/manager'
import { HostPlugin } from '../../src/plugin/host'
import { Engine } from '../../src/engine/engine'
import { pluginManagerProfile } from '../../../utils'

export class MockEngine extends Engine {
  onRegistration = jest.fn()
}

class MockManager extends PluginManager {
  constructor() {
    super(pluginManagerProfile)
  }
}

class MockHost extends HostPlugin {
  currentFocus = jest.fn()
  isFocus = jest.fn() // (name: string) =>
  focus = jest.fn() // (name: string) =>
  addView = jest.fn() // (profile: Profile) =>
  removeView = jest.fn() // (name: string) =>
  constructor() {
    super({ name: 'sidePanel', methods: [] })
  }
}

class MockView extends ViewPlugin {
  render = jest.fn(() => ({ id: 'element' } as Element))
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  constructor() {
    super({ name: 'view', methods: [], location: 'sidePanel' })
  }
}

describe('View Plugin', () => {
  let manager: MockManager
  let host: MockHost
  let view: MockView
  beforeEach(async () => {
    view = new MockView()
    host = new MockHost()
    manager = new MockManager()
    const engine = new MockEngine(manager)
    await engine.onload()
    engine.register([view, host])
  })

  test('Activate View call host addView', async () => {
    await manager.activatePlugin(['sidePanel', 'view'])
    expect(host.addView).toHaveBeenCalledWith(view.profile, { id: 'element' })
    expect(view.onActivation).toHaveBeenCalledTimes(1)
  })

  test('Deactive View call host removeView', async () => {
    await manager.activatePlugin(['sidePanel', 'view'])
    await manager.deactivatePlugin('view')
    expect(host.removeView).toHaveBeenCalledWith(view.profile)
    expect(view.onDeactivation).toHaveBeenCalledTimes(1)
  })
})