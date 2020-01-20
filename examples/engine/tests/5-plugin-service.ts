import { PluginManager, Engine, Plugin, PluginService, IPluginService} from '@remixproject/engine'

class GitPluginService {
  methods = ['fetch']
  fetch() {
    return true
  }
}

class CmdPlugin extends Plugin {

  git: IPluginService<GitPluginService>

  constructor() {
    super({ name: 'cmd' })
  }

  async onActivation() {
    this.git = await this.createService('git', new GitPluginService())
  }
}

test('[Example] Hosted Plugin', async () => {

  ///////////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const cmd = new CmdPlugin()
  const plugin = new Plugin({ name: 'caller' })

  // wait for the manager to be loaded
  await engine.onload()
  engine.register([cmd, plugin])
  await manager.activatePlugin(['cmd', 'caller'])

  // Call a service
  const fetched = await plugin.call('cmd.git', 'fetch')

  ////////////////////////////////////

  // Note: By default remix engine reroute ipfs call to it's gateway
  expect(fetched).toBeTruthy()
})