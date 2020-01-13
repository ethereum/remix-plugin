import { PluginManager, Engine, Plugin } from '@remixproject/engine'

test('[Example] Plugin Communication', async () => {

  ///////////////////////////////////


  class FirstPlugin extends Plugin {
    constructor() {
      // Expose method "getVersion" to other plugins
      super({ name: 'first', methods: ['getVersion']})
    }
    // Implementation of the exposed method
    getVersion() {
      return 0
    }
  }

  class SecondPlugin extends Plugin {
    constructor() {
      super({ name: 'second' })
    }

    getFirstPluginVersion(): Promise<number> {
      // Call the methode "getVersion" of plugin "first"
      return this.call('first', 'getVersion')
    }
  }


  const manager = new PluginManager()
  const engine = new Engine(manager)
  const first = new FirstPlugin()
  const second = new SecondPlugin()

  // wait for the manager to be loaded
  await engine.onload()

  // Register both plugins
  engine.register([first, second])

  // Activate both plugins
  await manager.activatePlugin(['first', 'second'])

  // Call method "getVersion" of first plugin from second plugin
  const firstVersion = await second.getFirstPluginVersion()

  ///////////////////////////////////

  expect(firstVersion).toBe(0)

  ///////////////////////////////////

  let value = 0
  second.on('first', 'count', (count: number) => value = count)
  first.emit('count', 1)
  first.emit('count', 2)

  second.off('first', 'count')

  first.emit('count', 3)

  ///////////////////////////////////

  expect(value).toBe(2)
})