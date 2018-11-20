import { PluginAPI } from './server/pluginAPI'
import { Message, RequestMsg, NotifMsg, Msg } from './models'

export interface Bridge<Plugin> {
  plugins: Plugin[]
  addPlugin(plugin: Plugin)
  removePlugin(name: string)
  send(message: Message, target?: string)
}

export interface IframePlugin {
  title: string
  url: string
  content: HTMLElement
}

export class PostMessage implements Bridge<IframePlugin> {
  private pendingRequest: Function[] = []
  public plugins: IframePlugin[]

  // TODO : Set the api outside the constructor
  constructor(private api: PluginAPI) {
    this.plugins = []
    window.addEventListener(
      'message',
      event => {
        if (event.type !== 'message') return
        // TODO : Check of origins
        const { title } = this.getPluginByOrigin(event.origin)

        const { key, type, id, value } = JSON.parse(event.data) as RequestMsg

        // value.unshift(title)
        if (!!this.pendingRequest[id]) {
          this.pendingRequest[id](value)
          delete this.pendingRequest[id]
        } else if (this.api[key] && this.api[key][type]) {
          this.addPendingRequest(id, type, key, event.origin)
          this.api[key][type](value)
        } else {
          const action = 'response'
          const error = `Endpoint ${key}/${type} not present`
          this.send({ id, action, key, type, error, value: null }, event.origin)
        }
      },
      false,
    )
  }

  /** Wait for the request to get a response */
  private addPendingRequest(
    id: number,
    type: string,
    key: string,
    origin: string,
  ) {
    const action = 'response'
    this.pendingRequest[id] = (value: any) => {
      this.send({ id, action, key, type, value, error: null }, origin)
    }
  }

  /** Find the plugin that has this origin */
  private getPluginByOrigin(origin: string) {
    const plugin = this.plugins.find(({ url }) => url === origin)
    if (!plugin) throw new Error(`No plugin found for origin ${origin}`)
    return plugin
  }

  public addPlugin(plugin: IframePlugin) {
    // TODO : Add Handshake here
    this.plugins = [...this.plugins, plugin]
  }

  public removePlugin(title: string) {
    this.plugins = this.plugins.filter(plugin => plugin.title !== title)
  }

  public broadcast(message: NotifMsg) {
    // TODO : add filter for permissions
    this.plugins.forEach(({ url }) => this.send(message, url))
  }

  public send(message: Msg, target: string) {
    const msg = JSON.stringify(message)
    const { content } = this.getPluginByOrigin(target)
    const iframe = content.querySelector('iframe')
    if (!iframe) return

    const window = iframe.contentWindow
    if (!window) return

    window.postMessage(msg, target)
  }
}
