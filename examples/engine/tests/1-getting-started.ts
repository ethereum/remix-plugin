import { PluginManager, Engine, Plugin } from '@remixproject/engine';

test('[Example] Getting Started', async () => {

  ////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const plugin = new Plugin({ name: 'plugin-name' })

  // Wait for the manager to be loaded
  await engine.onload()

  // Register plugins
  engine.register(plugin)

  // Activate plugins
  await manager.activatePlugin('plugin-name')

  ////////////////////////////

  expect(manager['profiles']['plugin-name']).toEqual({ name: 'plugin-name' })
})