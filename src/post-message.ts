import { PluginAPI } from './server/pluginAPI'
import { Message, RequestMsg, NotifMsg, Msg } from './models'

export interface Bridge<Plugin> {
  plugins: Plugin[]
  addPlugin(plugin: Plugin)
  removePlugin(name: string)
  send(message: Message, target?: string)
}

export interface IframePlugin {
  title: string,
  url: string,
  content: HTMLElement,
}


export class PostMessage implements Bridge<IframePlugin> {

  public plugins: IframePlugin[]

  // TODO : Set the api outside the constructor
  constructor(private api: PluginAPI) {
    this.plugins = []
    window.addEventListener(
      'message',
      event => {
        if (event.type !== 'message') return
        // TODO : Check of origins
        const { title } = this.getPlugin(event.origin)

        const { key, type, id, value } = JSON.parse(event.data) as RequestMsg
        const action = 'response'

        value.unshift(title)
        value.push((error: string, result: any) => {
          this.send({ id, action, key, type, value: [result], error }, event.origin)
        })
        if (this.api[key] && this.api[key][type]) {
            this.api[key][type].apply({}, value)
        } else {
          const error = `Endpoint ${key}/${type} not present`
          this.send({ id, action, key, type, error, value: null }, event.origin)
        }
      },
      false,
    )
  }

  private getPlugin(origin: string) {
    const plugin = this.plugins.find(({url}) => url === origin)
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
    this.plugins.forEach(({url}) => this.send(message, url))
  }

  public send(message: Msg, target: string) {
    const msg = JSON.stringify(message)
    const { content } = this.getPlugin(target)
    const iframe = content.querySelector('iframe')
    if (!iframe) return

    const window = iframe.contentWindow
    if (!window) return

    window.postMessage(msg, target)
  }

}