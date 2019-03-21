import { IPermissionHandler, PluginProfile, ModuleProfile, Permissions } from "../../src"

export class PermissionProvider {
  async confirm(message: string) {
    return { allow: true, remember: true }
  }
}

export class PermissionHandlerWithDI implements IPermissionHandler {

  public permissions: Permissions = {}

  constructor(private provider: PermissionProvider) {}

  clear(): void {
    this.permissions = {}
  }

  public async askPermission(
    from: PluginProfile,
    to: ModuleProfile,
  ): Promise<void> {
    if (!this.permissions[to.name]) this.permissions[to.name] = {}
    // Never allowed
    if (!this.permissions[to.name][from.name]) {
      const { allow, remember } = await this.openPermission(from, to, false)
      if (remember) {
        const hash = this.permissions[to.name][from.name].hash
        this.permissions[to.name][from.name] = { allow, hash }
      }
      if (!allow) throw new Error(`${from.name} is not allowed to call ${to.name}`)
    }
    // Remember not allow
    if (!this.permissions[to.name][from.name].allow) {
      throw new Error(`${from.name} is not allowed to call ${to.name}`)
    }
    // Remember allow but hash has changed
    if (this.permissions[to.name][from.name].hash !== from.hash) {
      const { allow, remember } = await this.openPermission(from, to, true)
      if (remember) {
        const hash = this.permissions[to.name][from.name].hash
        this.permissions[to.name][from.name] = { allow, hash }
      }
      if (!allow) throw new Error(`${from.name} is not allowed to call ${to.name}`)
    }
  }

  async openPermission(from: PluginProfile, to: ModuleProfile, wasAllow: boolean) {
    const msg = wasAllow
    ? `${from.name} would like to access plugin ${to}.\n Check it's new content ${from.hash}`
    : `${from.name} has changed and would like to access the plugin ${to}.\n Check it's new content ${from.hash}`
    return this.provider.confirm(msg)
  }

}
