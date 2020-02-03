import { PluginManager, Engine, Plugin, PluginService } from '@remixproject/engine'

test('[Example] Plugin Service with object', async () => {

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


/////////////////////////////////////////////
// TODO IN NEXT PR
/////////////////////////////////////////////

class GitService extends PluginService {
  path = 'git' // Name of the service
  methods = ['fetch']

  // Requires a reference to the plugin
  constructor(protected plugin: Plugin) {
    super()
  }

  fetch() {
    return true
  }

  commit() {
    return false
  }
}

class CmdPlugin extends Plugin {
  git: GitService

  constructor() {
    super({ name: 'cmd' })
  }

  // On Activation if git service is not defined, creates it
  async onActivation() {
    if (!this.git) {
      this.git = await this.createService('git', new GitService(this))
    }
  }
}


test('[Example] Plugin Service with class', async () => {

  ///////////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const plugin = new Plugin({ name: 'caller' })
  const cmd = new CmdPlugin()

  // wait for the manager to be loaded
  await engine.onload()
  engine.register([cmd, plugin])
  await manager.activatePlugin(['cmd', 'caller'])

  // Call a service
  const fetched = await plugin.call('cmd.git', 'fetch')

  ////////////////////////////////////

  expect(fetched).toBeTruthy()
})