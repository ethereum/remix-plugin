import { IframeService } from './iframe.service'
import { RemixModule, ModuleProfile, Message } from './remix-module'

export interface IframeProfile extends ModuleProfile {
  url: string
}

export class IframePlugin extends RemixModule {
  private id = 0
  private source: Window
  private origin: string

  constructor(
    json: IframeProfile,
    private service: IframeService
  ) {
    super(json)
    // Create the iframe
    const { iframe, origin } = this.service.create(json)
    this.source = iframe.contentWindow as Window
    this.origin = origin

    // Listen on Events
    json.notifications.forEach(({ type, key }) => {
      this.service.onEvent(json.type, type, key, (value: any) => {
        const msg = JSON.stringify({ type, key, value })
        this.source.postMessage(msg, this.origin)
      })
    })
  }

  /** Call a method of this plugin */
  call(message: Message) {
    this.checkMethod(message)
    this.id ++
    const msg = JSON.stringify({ id: this.id, ...message })
    this.source.postMessage(msg, this.origin)
    return new Promise((res, rej) => {
      this.service.onResponse(this.type, this.id, (value: any) => res(value))
    })
  }

}
