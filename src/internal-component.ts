import { API, Message, PluginProfile } from './types'
import { EventEmitter } from './event'

export class InternalComponent extends API {
  
  public notifs = {}
  public request: (value: { type: string; key: string; value: any }) => any
  public activate: () => Promise<void>
  public deactivate: () => void

  constructor(json: ModuleProfile) {
    super(json.type)

    this.activate = async () => {
      await this.create(json)
     }

    this.deactivate = () => {}
  }

  /** Create an iframe element */
  private async create({ InternalComponent, loadIn }: PluginProfile) {
    // Create
    try {
      const { type, key } = loadIn || {
        type: 'swipePanel',
        key: 'getIframeSource',
      }
      const message = { action: 'request', type, key, value: {} } as Message
      const parent = (await this.request(message)) as HTMLElement
      let view = new InternalComponent()
      parent.appendChild(view.render())
    } catch (err) {
      console.log(err)
    }

    // Handshake
    this.postMessage({ action: 'request', type: this.type, key: 'handshake' })
  }
}
