export abstract class StatelessComponent {

  protected view: HTMLElement

  constructor(protected parent: HTMLElement) {
    this.view = this.render()
    this.parent.appendChild(this.view)
  }

  // Should be implemented by the component
  protected abstract render(): HTMLElement

  public destroy() {
    this.parent.removeChild(this.view)
  }
}

export abstract class StatefulComponent extends StatelessComponent {

  constructor(protected parent: HTMLElement) {
    super(parent)
  }

  protected abstract update(): void
}


/*
import { API, Message, PluginProfile, ModuleProfile } from './types'
import { EventEmitter } from './event'
export class InternalComponent extends API {
  public notifs = {}
  public request: (value: { name: string; key: string; payload: any }) => any
  public activate: () => Promise<void>
  public deactivate: () => void
  constructor(json: ModuleProfile) {
    super(json.name)
    this.activate = async () => {
      await this.create(json)
     }
    this.deactivate = () => {}
  }
  // Create an iframe element
  private async create({ InternalComponent, loadIn }: PluginProfile) {
    // Create
    try {
      const { name, key } = loadIn || {
        name: 'swipePanel',
        key: 'getIframeSource',
      }
      const message = { action: 'request', name, key, payload: {} } as Message
      const parent = (await this.request(message)) as HTMLElement
      let view = new InternalComponent()
      parent.appendChild(view.render())
    } catch (err) {
      console.log(err)
    }
    // Handshake
    this.postMessage({ action: 'request', name: this.name, key: 'handshake' })
  }
}
 */