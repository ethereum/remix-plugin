import { Message, Api, PluginRequest } from '../types'

interface DevMode {
  port: number | string
}

export interface RemixExtensionOptions {
  useCustomBootStrapTheme: boolean
}

export interface Theme {
  url: string
  quality: 'dark' | 'light'
}

function defaultOptions  (options?: Partial<RemixExtensionOptions>): RemixExtensionOptions {
  const opts = options || {}
  return {
    useCustomBootStrapTheme: opts.useCustomBootStrapTheme || false
  } as RemixExtensionOptions
}

export class RemixExtension<T extends Api = any> {
  private devMode: DevMode
  private source: Window
  private origin: string
  private notifications: {
    [name: string]: {
      [key: string]: (...payload: any[]) => void
    }
  } = {}
  private pendingRequests: {
    [id: number]: (payload: any, error?: Error) => void
  } = {}
  private id = 0
  private handshake: () => any
  protected currentRequest: PluginRequest
  public isLoaded = false

  constructor(options?: RemixExtensionOptions) {
    const opts = defaultOptions(options)
    this.initListenOnSwitchTheme(opts)

    window.addEventListener('message', event => this.getMessage(event), false)
  }

  private initListenOnSwitchTheme (options: RemixExtensionOptions) {
    if (options.useCustomBootStrapTheme) return
    const cssLink = document.createElement('link')
    cssLink.setAttribute('rel', 'stylesheet')
    document.head.appendChild(cssLink)
    this.listen('theme', 'switchTheme', (theme: Theme) => {
      cssLink.setAttribute('href', theme.url)
      document.documentElement.style.setProperty('--theme', theme.quality)
    })
  }

  /** Manage a message coming from the parent origin */
  private async getMessage(event: MessageEvent) {
    if (!event.source) throw new Error('No source')
    if (!this.checkOrigin(event.origin)) return
    if (!event.data) throw new Error('No data')
    const msg: Message = event.data
    if (!msg) throw new Error('No message in data')

    const { action, key, name, payload, id, requestInfo, error } = msg
    try {

      if (action === 'request' && key === 'handshake') {
        this.source = event.source as Window
        this.origin = event.origin
        if (this.handshake) {
          this.isLoaded = true
          this.handshake()
        }
        return
      }

      if (!this.source) throw new Error('Handshake before communicating')

      if (action === 'notification') {
        if (this.notifications[name] && this.notifications[name][key]) {
          this.notifications[name][key](...payload)
        }
      } else if (action === 'response') {
        if (this.pendingRequests[id]) {
          this.pendingRequests[id](payload, error)
          delete this.pendingRequests[id]
        }
      } else if (action === 'request') {
        if (!this[key]) {
          throw new Error(`Method ${key} doesn't exist on ${name}`)
        }
        this.currentRequest = requestInfo
        const result = await this[key](payload)
        this.send({action, name, key, id, payload: result})
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.error };
      (<Window>event.source).postMessage(message, event.origin)
    }

  }

  /** Check if the sender has the right origin */
  private checkOrigin(origin: string) {
    const localhost = this.devMode ? [
      `http://127.0.0.1:${this.devMode.port}`,
      `http://localhost:${this.devMode.port}`,
      `https://127.0.0.1:${this.devMode.port}`,
      `https://localhost:${this.devMode.port}`,
    ] : []
    return this.origin
      ? this.origin === origin
      : [
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org",
        ...localhost
      ].includes(origin)
  }

  /** Send a message to source parent */
  private send(message: Partial<Message>) {
    if (!this.source || !this.origin) {
      const devmode = this.devMode
      ? `Make sure the port of the IDE is ${this.devMode.port}`
      : 'If you are using a local IDE, make sure to add devMode: extension.setDevMode(idePort)'
      throw new Error(`Not connected to the IDE. ${devmode}`)
    }
    this.source.postMessage(message, this.origin)
  }

  /**
   * Set the plugin in a developer mode which accept localhost origin
   * @param port The port of the localhost for the IDE
   */
  public setDevMode(port: number | string = 8080) {
    this.devMode = { port }
  }

  /** Listen on notification events from another plugin or module */
  public listen(name: string, key: string, cb: (...payload: any[]) => void) {
    if (!this.notifications[name]) {
      this.notifications[name] = {}
    }
    this.notifications[name][key] = cb
  }

  /** Call a method from another plugin or module */
  public call(name: string, key: string, ...payload: any): Promise<any> {
    const action = 'request'
    const id = this.id++
    return new Promise((res, rej) => {
      this.pendingRequests[id] = (result: any, error?: Error) => {
        if (error) rej(new Error(`Error from IDE : ${error}`))
        res(result)
      }
      this.send({ action, name, key, payload, id })
    })
  }

  /** Emit an event */
  public emit<Key extends keyof T['events']>(key: Key, payload: T['events'][Key]) {
    this.send({ action: 'notification', key: key as string, payload })
  }

  /** Run when the handshake is done */
  public loaded(): Promise<void> {
    return new Promise((res, rej) => {
      if (this.isLoaded) return res()
      this.handshake = () => res()
    })
  }
}

