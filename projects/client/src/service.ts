import { PluginClient, handleConnectionError } from './client'
import { IPluginService } from './types'

/**
 * Create a plugin service
 * @param path The path of the service separated by '.' (ex: 'box.profile')
 * @param service The service template
 * @note If the service doesn't provide a property "methods" then all methods are going to be exposed by default
 */
export function createService<T extends Record<string, any>>(path: string, service: T): IPluginService<T> {
  if (service.path && (service.path as string).split('.').pop() !== path) {
    throw new Error(`Service path ${service.path} is different from the one provided: ${path}`)
  }
  const { methods = Object(service).keys() } = service
  return {
    ...service,
    methods,
    path
  }
}

/**
 * Connect the service to the plugin client
 * @param client The main client of the plugin
 * @param service A service to activate
 */
export function activateService(client: PluginClient, service: IPluginService) {
  client.methods = [
    ...client.methods,
    ...service.methods
  ]
  service.methods.forEach(method => {
    client[service.path] = service[method].bind(service)
  })
  return client.call('manager', 'updateProfile', { methods: client.methods})
}

/**
 * A node that forward the call to the right path
 */
export abstract class PluginService {
  protected methods: string[]
  protected abstract path: string
  protected abstract client: PluginClient

  constructor() {}

  emit(key: string, ...payload) {
    this.client.emit(key, ...payload)
  }

  /**
   * Create a subservice under this service
   * @param name The name of the subservice inside this service
   * @param service The subservice to add
   */
  async createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>> {
    if (this.methods.includes(name)) {
      throw new Error('A service cannot have the same name as an exposed method')
    }
    const path = `${this.path}.${name}`
    const _service = createService(path, service)
    await activateService(this.client, _service)
    return _service
  }

  /**
   * Prepare a service to be lazy loaded
   * @param name The name of the subservice inside this service
   * @param factory A function to create the service on demand
   */
  prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>> {
    if (this.methods.includes(name)) {
      throw new Error('A service cannot have the same name as an exposed method')
    }
    const path = `${this.path}.${name}`
    return this.client.activateService[path] = async () => {
      const service = factory()
      const _service = createService(path, service)
      await activateService(this.client, _service)
      delete this.client.activateService[path]
      return _service
    }
  }

}
