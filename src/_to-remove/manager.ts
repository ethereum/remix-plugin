export class Manager {
  private pendingRequest: Map<number, Function> = new Map()
  private plugins: { [type: string]: IframePlugin | ModulePlugin } = {}

  constructor() {
    window.addEventListener('message', event => {
      // TODO: Check origins
      if (typeof event.data !== 'string') return
      if (!this.findByOrigin(event.origin)) {
        throw new Error('This plugin is not registered')
      }
      this.getRequestFromIframe(event)
    })
  }

  private findByOrigin(origin: string) {
    for (const key in this.plugins) {
      if (this.plugins[key].url) return this.plugins[key]
    }
    return undefined
  }

  private exportKey(type: string, key: string) {
    return this.plugins[type].exports.includes(method => method.key === key)
  }

  private sendToIframe(source: Window, message: any, target: string) {
    source.postMessage(JSON.stringify(message), target)
  }

  public registerIframe(json: any, modal: any, content: HTMLElement) {
    const iframe = content.querySelector('iframe')
    if (!iframe) throw new Error('No iframe found for this plugin')
    const source = iframe.contentWindow
    if (!source) throw new Error('No window found in the iframe')
    this.plugins[json.title] = { ...json, source, kind: 'iframe' }
  }

  public unregister(title: string) {
    delete this.plugins[title]
  }

  /**
   * Handle a request from a Module
   */
  public async getRequestFromModule(msg: Message) {
    const { type, id, key, value } = msg
    const targetPlugin = this.plugins[type]

    const createResponse = (result) => ({
      ...msg, action: 'response', value: result
    })

    switch (targetPlugin.kind) {
      case 'module': {
        if (!targetPlugin[key]) {
          throw new Error(`${key} is not a available in ${type}`)
        }
        const result = targetPlugin[key](value)
        return createResponse(result)
      }
      case 'iframe': {
        if (!this.exportKey(type, key)) {
          throw new Error(`${key} is not a available in ${type}`)
        }
        const target = targetPlugin.url
        const src = targetPlugin.source
        this.sendToIframe(src, msg, target)
        return new Promise((res, rej) => {
          // TOOD : Handle Errror
          this.pendingRequest[id] = (result) => {
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

  /**
   * Handle requests coming from Iframes
   */
  public getRequestFromIframe({ data, origin, source }: MessageEvent) {
    const msg = JSON.parse(data) as Message
    const { type, key, id, value } = msg

    // Add a response to the pending list
    const responseToOrigin = (result: any) => {
      const action = 'response'
      this.sendToIframe(
        source as Window,
        { ...msg, value: result, action },
        origin,
      )
    }

    // Return a post message with the error inside
    const throwError = (error: string) => {
      const action = 'response'
      this.sendToIframe(source as Window, { ...msg, action, error }, origin)
    }

    const targetPlugin = this.plugins[type]

    if (!targetPlugin) throwError(`${type} is not a plugin`)
    if (!!this.pendingRequest[id]) {
      this.pendingRequest[id](value)
      delete this.pendingRequest[id]
    }

    switch (targetPlugin.kind) {
      case 'module': {
        if (!!targetPlugin[key]) {
          // Modules methods must be a Promise
          targetPlugin[key](value)
            .then(res => responseToOrigin(res))
            .catch(err => throwError(err))
        } else {
          throwError(`${key} is not a available in ${type}`)
        }
        break
      }
      case 'iframe': {
        if (this.exportKey(type, key)) {
          this.pendingRequest[id] = (res) => responseToOrigin(res)
          const target = targetPlugin.url
          const targetSrc = targetPlugin.source
          this.sendToIframe(targetSrc, msg, target)
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

export interface Plugin {
  kind: 'iframe' | 'module'
  title: string
  url: string
  exports: any[]
}

export interface IframePlugin extends Plugin {
  kind: 'iframe'
  source: Window
}

export interface ModulePlugin extends Plugin {
  kind: 'module'
}

export interface Message {
  id: number
  action: 'response' | 'request' | 'notification'
  type: string
  key: string
  value: any
  error: string
}
