import { Plugin, PluginOptions } from "@remixproject/engine"
import { Profile } from '../../utils/src/types/profile'
import { Disposable, commands } from "vscode"

export const transformCmd = (name: string, method: string) => `${name}.${method}`

interface CommandOptions extends PluginOptions {
  transformCmd: (name: string, method: string) => string
}

// WIP
export class CommandPlugin extends Plugin {
  subscriptions: Disposable[] = []
  options: CommandOptions

  constructor(profile: Profile) {
    super(profile)
    this.setOptions({ transformCmd })
  }

  setOptions(options: Partial<CommandOptions>) {
    return super.setOptions(options)
  }

  activate() {
    this.subscriptions = this.profile.methods.map(method => {
      const cmd = this.options.transformCmd(this.profile.name, method)
      return commands.registerCommand(cmd, (...args) => this.callPluginMethod(method, args))
    })
    super.activate()
  }

  deactivate() {
    super.deactivate()
    this.subscriptions.forEach(sub => sub.dispose())
  }
}
