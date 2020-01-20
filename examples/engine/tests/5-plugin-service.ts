import { PluginManager, Engine, Plugin, PluginService, IPluginService} from '@remixproject/engine'


test('[Example] Hosted Plugin', async () => {

  ///////////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const cmd = new Plugin({ name: 'cmd' })
  const plugin = new Plugin({ name: 'caller' })

  // wait for the manager to be loaded
  await engine.onload()
  engine.register([cmd, plugin])
  await manager.activatePlugin(['cmd', 'caller'])

  // Create a service inside cmd
  // IMPORTANT: Your plugin needs to be activated before creating a service
  await cmd.createService('git', {
    methods: ['fetch'],
    fetch: () => true,    // exposed
    commit: () => false   // not exposed
  })

  // Call a service
  const fetched = await plugin.call('cmd.git', 'fetch')

  ////////////////////////////////////

  expect(fetched).toBeTruthy()
})