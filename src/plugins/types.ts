import { ModuleManager } from '../module-manager'


export abstract class RemixPlugin {

  public type: string
  protected manager: ModuleManager

  /**
   * Activate lazily the plugin
   * @param manager The global module Manager
   */
  public async activate(manager: ModuleManager) {}

  /** Deactivate the plugin and all the methods it exposes */
  public async deactivate() {}

  /**
   * Export a method to the manager
   * @param key The name of the method
   * @param callback The method exposed
   */
  protected addMethod(key: string, callback: Function) {
    this.manager.addMethod(this.type, key, callback)
  }

}
