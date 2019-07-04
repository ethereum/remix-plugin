import { PluginEngine, Plugin } from '@remixproject/engine'
import { ICompiler, IFileSystem } from '@utils'

type RemixApiMap = Readonly<{
  solidity: ICompiler,
  fileManager: IFileSystem
}>

export class RemixPluginEngine extends PluginEngine<RemixApiMap> {
  onActivated(plugin: Plugin) {
    // Not implemented yet
  }

  onDeactivated(plugin: Plugin) {
    // Not implemented yet
  }

  onRegistration(plugin: Plugin) {
    // Not implements yet
  }
}