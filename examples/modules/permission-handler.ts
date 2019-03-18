import { PermissionHandler } from "../../src/engine/permission-handler"

export class SecurityHandler extends PermissionHandler {

  async confirm(message: string) {
    return { allow: true, remember: true }
  }
}