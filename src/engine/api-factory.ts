import { ModuleProfile, Api } from "src/types"

interface PluginRequest {
  from: string
}

export abstract class ApiFactory<T extends Api = any> {
  readonly abstract profile: ModuleProfile<T>
  private requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest

  addRequest(request: PluginRequest, method: string, args: any[]) {
    return new Promise((resolve, reject) => {
      // Add a new request to the queue
      this.requestQueue.push(async () => {
        this.currentRequest = request
        const result = await this[method](...args)
        resolve(result)
        // Remove current request and call next
        this.requestQueue.shift()
        if (this.requestQueue.length !== 0) this.requestQueue[0]()
      })
      // If there is only one request waiting, call it
      if (this.requestQueue.length === 1) {
        this.requestQueue[0]()
      }
    })
  }

  api() {
    const api = {}
    const methods = this.profile.methods || []
    methods.forEach(method => api[method as string] = this[method as string])
    return {
      api,
      ...this.profile,
      addRequest: (request: PluginRequest, method: string, args: any[]) => this.addRequest(request, method, args)
    }
  }
}


class AppManager {
  calls = {}
  // When a method is called we update checksecurity
  activateModule(api) {
    api.methods.forEach(method => {
      this.calls[api.name][method] = async (request: PluginRequest, ...args: any[]) => {
        const result = await api.addRequest(request, method, args)
        return result
      }
    })
  }

  // When a plugin call a module, we pass the request object as argument
  activatePlugin(plugin) {
    plugin.callModule = ({ name, key, payload }) => {
      const request = { from: plugin.name }
      return this.calls[name][key](request, ...payload)
    }
  }
}