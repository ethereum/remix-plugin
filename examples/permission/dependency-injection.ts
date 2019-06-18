import { Profile } from '@utils'
import { IPermissionHandler, Permissions } from '@remixproject/engine'

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
    from: Profile,
    to: Profile,
  ): Promise<boolean> {
    if (!this.permissions[to.name]) this.permissions[to.name] = {}
    // Never allowed
    if (!this.permissions[to.name][from.name]) {
      const { allow, remember } = await this.openPermission(from, to, false)
      if (remember) {
        const hash = this.permissions[to.name][from.name].hash
        this.permissions[to.name][from.name] = { allow, hash }
      }
      if (!allow) return false
    }
    // Remember not allow
    if (!this.permissions[to.name][from.name].allow) {
      return false
    }
    // Remember allow but hash has changed
    if (this.permissions[to.name][from.name].hash !== from.hash) {
      const { allow, remember } = await this.openPermission(from, to, true)
      if (remember) {
        const hash = this.permissions[to.name][from.name].hash
        this.permissions[to.name][from.name] = { allow, hash }
      }
      if (!allow) return false
    }
    return true
  }

  async openPermission(from: Profile, to: Profile, wasAllow: boolean) {
    const msg = wasAllow
    ? `${from.name} would like to access plugin ${to}.\n Check it's new content ${from.hash}`
    : `${from.name} has changed and would like to access the plugin ${to}.\n Check it's new content ${from.hash}`
    return this.provider.confirm(msg)
  }

}
