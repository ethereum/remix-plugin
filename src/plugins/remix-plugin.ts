import { ModuleManager } from '../module-manager'


export abstract class RemixPlugin {

  protected abstract manager: ModuleManager

  constructor(public type: string) {}

  /**
   * Activate lazily the plugin
   * @param manager The global module Manager
   */
  public abstract async activate(manager: ModuleManager)

  /** Deactivate the plugin and all the methods it exposes */
  public abstract async deactivate()

  /**
   * Export a method to the manager
   * @param key The name of the method
   * @param callback The method exposed
   */
  protected addMethod(key: string, callback: Function) {
    this.manager.addMethod(this.type, key, callback)
  }

}