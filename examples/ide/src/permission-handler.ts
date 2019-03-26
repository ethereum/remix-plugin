import { IPermissionHandler, Permissions, PluginProfile, ModuleProfile } from 'remix-plugin'

export class PermissionHandler implements IPermissionHandler {
  permissions: Permissions = {}

  public async askPermission(
    from: PluginProfile<any>,
    to: ModuleProfile<any>,
  ): Promise<void> {

  }
}
