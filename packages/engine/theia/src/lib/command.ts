import { Plugin, PluginOptions } from "@remixproject/engine";
import { Profile } from '@remixproject/plugin-utils';
import * as theia from '@theia/plugin';

export const transformCmd = (name: string, method: string) => `${name}.${method}`

export interface CommandOptions extends PluginOptions {
  transformCmd: (name: string, method: string) => string
}

export class CommandPlugin extends Plugin {
  subscriptions: theia.Disposable[] = []
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
      return theia.commands.registerCommand(cmd, (...args) => this.callPluginMethod(method, args))
    })
    super.activate()
  }

  deactivate() {
    super.deactivate()
    this.subscriptions.forEach(sub => sub.dispose())
  }
}
