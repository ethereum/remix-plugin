export class Manager {
  public pendingRequest: RequestMap = {}
  public plugins: PluginMap = {}

  constructor() {}

  /** Check if the plugin[type] exposes a specific key */
  public exportKey(type: string, key: string) {
    return this.plugins[type].exports.includes(method => method.key === key)
  }

  public importKey(type: string, key: string) {
    return this.plugins[type].imports.includes(method => method.key === key)
  }

  /** Broadcast an notification to every plugin listening */
  public broadcast(msg: Message) {
    for (const type in this.plugins) {
      if (this.importKey(type, msg.key)) {
        const plugin = this.plugins[type]
        if (plugin.kind === 'iframe') {
          this.sendToIframe(plugin.source, msg, plugin.url)
        } else if (plugin.kind === 'module') {
          plugin.on[msg.key](msg)
        }
      }
    }
  }

  /** Send a message to an iframe */
  public sendToIframe(source: Window, message: any, target: string) {
    source.postMessage(JSON.stringify(message), target)
  }

  /** Register a plugin to the manager */
  public register(plugin: IframePlugin | ModulePlugin) {
    this.plugins[plugin.title] = plugin
  }

  /**
   * Remove a plugin
   * @param title The title (or type) of the plugin
   */
  public unregister(title: string) {
    delete this.plugins[title]
  }

}

/******* IFRAME ********/


export class IframeManager {

  constructor(private manager: Manager) {
    window.addEventListener('message', event => {
      // TODO: Check origins
      if (typeof event.data !== 'string') return
      if (!this.findByOrigin(event.origin)) {
        throw new Error('This plugin is not registered')
      }
      const msg = JSON.parse(event.data) as Message
      if (msg.action === 'request' || msg.action === 'response') {
        this.request(event)
      } else if (msg.action === 'notification') {
        this.manager.broadcast(msg)
      }
    })
  }


  /** Find a plugin by it origin */
  private findByOrigin(origin: string) {
    for (const type in this.manager.plugins) {
      const plugin = this.manager.plugins[type]
      if (plugin.kind === 'iframe' && plugin.url === origin) {
        return plugin
      }
    }
    return undefined
  }

  /**
   * Register an Iframe plugin to the manager
   * @param json the description of the plugin
   * @param modal The modal element where the iframe lives
   * @param content The HTML element that hold the iframe
   */
  public register(json: any, modal: any, content: HTMLElement) {
    const iframe = content.querySelector('iframe')
    if (!iframe) throw new Error('No iframe found for this plugin')
    const source = iframe.contentWindow
    if (!source) throw new Error('No window found in the iframe')
    this.manager.register({ ...json, source, kind: 'iframe' })
  }


  /**
   * Handle requests coming from Iframes
   */
  public request({ data, origin, source }: MessageEvent) {
    const msg = JSON.parse(data) as Message
    const { type, key, id, value } = msg

    // Add a response to the pending list
    const responseToOrigin = (result: any) => {
      const action = 'response'
      this.manager.sendToIframe(
        source as Window,
        { ...msg, value: result, action },
        origin,
      )
    }

    // Return a post message with the error inside
    const throwError = (error: string) => {
      const action = 'response'
      this.manager.sendToIframe(source as Window, { ...msg, action, error }, origin)
    }

    const targetPlugin = this.manager.plugins[type]
    const pendingRequests = this.manager.pendingRequest

    if (!targetPlugin) throwError(`${type} is not a plugin`)
    if (!!pendingRequests[id]) {
      pendingRequests[id](value)
      delete pendingRequests[id]
    }

    switch (targetPlugin.kind) {
      case 'module': {
        if (!!targetPlugin[key]) {
          // Modules methods must be a Promise
          targetPlugin.call[key](value)
            .then(res => responseToOrigin(res))
            .catch(err => throwError(err))
        } else {
          throwError(`${key} is not a available in ${type}`)
        }
        break
      }
      case 'iframe': {
        if (this.manager.exportKey(type, key)) {
          pendingRequests[id] = (res) => responseToOrigin(res)
          const target = targetPlugin.url
          const targetSrc = targetPlugin.source
          this.manager.sendToIframe(targetSrc, msg, target)
        } else {
          throwError(`${key} is not a available in ${type}`)
        }
        break
      }
      default: {
        throwError('Plugin should be a "module" or "iframe"')
      }
    }
  }

}


/******* MODULE ********/

export class ModuleManager {

  constructor(private manager: Manager) {}


  /**
   * Register a module plugin to the manager
   * @param json The description of module
   * @param api The API functions to call
   */
  public register(json: any, api: any) {
    this.manager.register({ ...json, ...api, kind: 'module' })
  }

  /**
   * Handle a request from a Module
   * @param msg The request message coming from the module
   */
  public async request(msg: Message) {
    const { type, id, key, value } = msg
    const targetPlugin = this.manager.plugins[type]

    const createResponse = (result) => ({
      ...msg, action: 'response', value: result
    })

    switch (targetPlugin.kind) {
      case 'module': {
        if (!targetPlugin[key]) {
          throw new Error(`${key} is not a available in ${type}`)
        }
        const result = await targetPlugin.call[key](value)
        return createResponse(result)
      }
      case 'iframe': {
        if (!this.manager.exportKey(type, key)) {
          throw new Error(`${key} is not a available in ${type}`)
        }
        const target = targetPlugin.url
        const src = targetPlugin.source
        this.manager.sendToIframe(src, msg, target)
        return new Promise((res, rej) => {
          // TOOD : Handle Errror
          this.manager.pendingRequest[id] = (result) => {
            const response = createResponse(result)
            res(response)
          }
        })
      }
      default: {
        throw new Error('Plugin should be a "module" or "iframe"')
      }
    }
  }
}


export interface Plugin {
  kind: 'iframe' | 'module'
  title: string
  exports: any[],
  imports: any[]
}

export interface IframePlugin extends Plugin {
  kind: 'iframe',
  source: Window,
  url: string
}

export interface ModulePlugin extends Plugin {
  kind: 'module',
  /** Methods to call when receiving a request */
  call: {
    [key: string]: (value?: any) => Promise<any>
  },
  /** Methods to call when receiving a notification */
  on: {
    [key: string]: (message: Message) => any
  }
}

export interface PluginMap {
  [type: string]: IframePlugin | ModulePlugin
}

export interface Message {
  id: number
  action: 'response' | 'request' | 'notification'
  type: string
  key: string
  value: any
  error: string
}

export interface RequestMap {
  [id: number]: (result: any) => any
}