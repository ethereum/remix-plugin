import { Profile } from '@utils'
import { IPermissionHandler, Permissions } from '@remixproject/engine'

/**
 * Example of a PermissionHandler using localStorage
 */
export abstract class SecurityHandler implements IPermissionHandler {
  public permissions: Permissions = {}
  abstract confirm(
    message: string,
  ): Promise<{ allow: boolean; remember: boolean }>

  constructor() {
    const permission = localStorage.getItem('permissions')
    this.permissions = permission ? JSON.parse(permission) : {}
  }

  private persistPermissions() {
    const permissions = JSON.stringify(this.permissions)
    localStorage.setItem('permissions', permissions)
  }

  public clear() {
    localStorage.removeItem('permissions')
  }

  /**
   * Show a message to ask the user for a permission
   * @param from The name and hash of the plugin that make the call
   * @param to The name of the plugin that receive the call
   * @param wasAllow Did the plugin have changed its hash
   */
  private async openPermission(
    from: Profile,
    to: Profile,
    wasAllow: boolean,
  ): Promise<{ allow: boolean; remember: boolean }> {
    const msg = wasAllow
      ? `${from.name} would like to access plugin ${to}.\n Check it's new content ${from.hash}`
      : `${from.name} has changed and would like to access the plugin ${to}.\n Check it's new content ${from.hash}`
    return this.confirm(msg)
  }

  /**
   * Check if a plugin has the permission to call another plugin and askPermission if needed
   * @param from the profile of the plugin that make the call
   * @param to The profile of the module that receive the call
   */
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
      this.persistPermissions()
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
      this.persistPermissions()
      if (!allow) return false
    }
    return true
  }
}

export class PermissionHandlerWithAbstract extends SecurityHandler {

  async confirm(message: string) {
    return { allow: true, remember: true }
  }
}