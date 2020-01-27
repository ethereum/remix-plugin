// import { PluginClient } from './client'
// import { IPluginService } from './types'
// import { getRootPath } from '../../utils/src/method-path'

// /**
//  * A node that forward the call to the right path
//  */
// export abstract class PluginService implements IPluginService {
//   public methods: string[]
//   readonly abstract path: string
//   protected abstract client: PluginClient

//   constructor() {}

//   emit(key: string, ...payload: any[]) {
//     this.client.emit(key, ...payload)
//   }

//   /**
//    * Create a subservice under this service
//    * @param name The name of the subservice inside this service
//    * @param service The subservice to add
//    */
//   async createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>> {
//     if (this.methods.includes(name)) {
//       throw new Error('A service cannot have the same name as an exposed method')
//     }
//     const path = `${this.path}.${name}`
//     const _service = createService(path, service)
//     await activateService(this.client, _service)
//     return _service
//   }

//   /**
//    * Prepare a service to be lazy loaded.
//    * Service can be activated by doing `client.activateService(path)`
//    * @param name The name of the subservice inside this service
//    * @param factory A function to create the service on demand
//    */
//   prepareService<S extends Record<string, any>>(name: string, factory: () => S): void {
//     if (this.methods.includes(name)) {
//       throw new Error('A service cannot have the same name as an exposed method')
//     }
//     const path = `${this.path}.${name}`
//     this.client.activateService[path] = async () => {
//       const service = factory()
//       const _service = createService(path, service)
//       await activateService(this.client, _service)
//       delete this.client.activateService[path]
//       return _service
//     }
//   }

// }

// /**
//  * Return the methods of a service, except "constructor" and methods starting with "_"
//  * @param instance The instance of a class to get the method from
//  */
// export function getMethods(service: IPluginService) {
//   // If service exposes methods, use them
//   if (service.methods) {
//     for (const method of service.methods) {
//       if (!(method in service)) {
//         throw new Error(`Method ${method} is not part of serivce`)
//       }
//     }
//     return service.methods
//   }
//   // Else get the public methods (without "_")
//   if (service instanceof PluginService) {
//     const methods = Object.getPrototypeOf(service)
//     return Object.getOwnPropertyNames(methods).filter(m => {
//       return m !== 'constructor' && !m.startsWith('_')
//     })
//   } else {
//     return Object.getOwnPropertyNames(service).filter(key => {
//       return typeof service[key] === 'function' && !key.startsWith('_')
//     })
//   }
// }

// /**
//  * Create a plugin service
//  * @param path The path of the service separated by '.' (ex: 'box.profile')
//  * @param service The service template
//  * @note If the service doesn't provide a property "methods" then all methods are going to be exposed by default
//  */
// export function createService<T extends Record<string, any>>(path: string, service: T): IPluginService<T> {
//   if (service.path && getRootPath(service.path) !== path) {
//     throw new Error(`Service path ${service.path} is different from the one provided: ${path}`)
//   }

//   const methods: string[] = getMethods(service)

//   for (const method of methods) {
//     if (!(method in service)) {
//       throw new Error(`Method ${method} is not part of serivce ${path}`)
//     }
//   }

//   if (service instanceof PluginService) {
//     if (!service.methods) {
//       service.methods = methods
//     }
//     return service as IPluginService
//   } else {
//     return { ...service, methods, path }
//   }
// }

// /**
//  * Connect the service to the plugin client
//  * @param client The main client of the plugin
//  * @param service A service to activate
//  */
// export function activateService(client: PluginClient, service: IPluginService) {
//   client.methods = [
//     ...(client.methods || []),
//     ...service.methods
//   ]
//   service.methods.forEach(method => {
//     client[`${service.path}.${method}`] = service[method].bind(service)
//   })
//   return client.call('manager', 'updateProfile', { methods: client.methods})
// }
