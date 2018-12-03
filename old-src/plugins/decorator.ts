import { ModuleManager } from '../module-manager'

/**
 * Decorator around plugin classes
 * @param config Config about the plugin
 */
export function Plugin(config: {type: string}) {
  return function<T extends {new(...args: any[])}>(constructor: T) {

    return class extends constructor {
      public type = config.type

      activate(manager: ModuleManager) {
        // For each method of the plugin add it to the manager
        Object.keys(constructor.prototype).forEach(key => {
          manager.addMethod(config.type, key, constructor.prototype[key])
        })
      }
    }
  }
}