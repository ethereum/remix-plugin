import { Profile } from '@utils'
import { IPermissionHandler } from '@remixproject/engine'

export class PermissionHandler implements IPermissionHandler {
  responseToConfirm = { allow: true, remember: true }
  permissions = {}
  async askPermission(from: Profile, to: Profile) {
    return this.responseToConfirm.allow
  }
}
