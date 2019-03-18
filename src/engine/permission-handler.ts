export interface Permissions {
  [to: string]: {
    [from: string]: {
      allow: boolean,
      hash: string,
    }
  }
}

export interface IPermissionProvider {
  confirm(message: string): Promise<{ allow: boolean, remember: boolean }>
  /** Clear the permission object */
  clear(): void
}

export interface IPermissionHandler {
  askPermission(from: {name: string, hash: string}, to: string): Promise<boolean>
}

/**
 * Example of a PermissionHandler using OOP
 */
export abstract class PermissionHandler implements IPermissionHandler, IPermissionProvider {

  public permissions: Permissions
  abstract confirm(message: string): Promise<{ allow: boolean, remember: boolean }>

  constructor() {
    this.permissions = JSON.parse(localStorage.getItem('permissions'))
  }

  private setPermissions() {
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
    from: {name: string, hash: string},
    to: string, wasAllow: boolean
  ): Promise<{ allow: boolean, remember: boolean }> {
    const msg = wasAllow
      ? `${from.name} would like to access plugin ${to}.\n Check it's new content ${from.hash}`
      : `${from.name} has changed and would like to access the plugin ${to}.\n Check it's new content ${from.hash}`
    return { allow: true, remember: true }
  }

  /**
   * Check if a plugin has the permission to call another plugin and askPermission if needed
   * @param from The name and hash of the plugin that make the call
   * @param to The name of the plugin that receive the call
   */
  public async askPermission(from: {name: string, hash: string}, to: string): Promise<boolean> {
    if (!this.permissions[to]) this.permissions[to] = {}
    // Never allowed
    if (!this.permissions[to][from.name]) {
      const { allow, remember } = await this.openPermission(from, to, false)
      if (remember) this.permissions[to][from.name] = { allow, hash: this.permissions[to][from.name].hash }
      this.setPermissions()
      return allow
    }
    // Remember not allow
    if (!this.permissions[to][from.name].allow) {
      return false
    }
    // Remember allow but hash has changed
    if (this.permissions[to][from.name].hash !== from.hash) {
      const { allow, remember } = await this.openPermission(from, to, true)
      if (remember) this.permissions[to][from.name] = { allow, hash: this.permissions[to][from.name].hash }
      this.setPermissions()
      return allow
    }
    // Is allowed for this hash
    return true
  }
}
