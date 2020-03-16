import { ViewPlugin } from './view'
import { Message, ExternalProfile, Profile, LocationProfile } from '../../../utils'
import { ExternalPlugin, transformUrl } from './external'

type MessageListener = ['message', (e: MessageEvent) => void, false]

export type IframeProfile = Profile & LocationProfile & ExternalProfile

/**
 * Connect an Iframe client to the engine.
 * @dev This implements the ViewPlugin as it cannot extends two class. Maybe use a mixin at some point
 */
export class IframePlugin extends ExternalPlugin implements ViewPlugin {
  // Listener is needed to remove the listener
  private readonly listener: MessageListener = ['message', e => this.getEvent(e), false]
  private iframe = document.createElement('iframe')
  private origin: string
  private source: Window

  constructor(public profile: IframeProfile) {
    super(profile)
  }

  /** Implement "activate" of the ViewPlugin */
  async activate() {
    await this.call(this.profile.location, 'addView', this.profile, this.render())
    super.activate()
  }

  /** Implement "deactivate" of the ViewPlugin */
  deactivate() {
    this.iframe.remove()
    window.removeEventListener(...this.listener)
    this.call(this.profile.location, 'removeView', this.profile)
    super.deactivate()
  }

  /** Get message from the iframe */
  private async getEvent(event: MessageEvent) {
    if (event.origin !== this.origin) return // Filter only messages that comes from this origin
    const message: Message = event.data
    this.getMessage(message)
  }

  /**
   * Post a message to the iframe of this plugin
   * @param message The message to post
   */
  protected postMessage(message: Partial<Message>) {
    if (!this.source) {
      throw new Error('No window attached to Iframe yet')
    }
    this.source.postMessage(message, this.origin)
  }


  /** Create and return the iframe */
  render() {
    if (this.iframe.contentWindow) {
      throw new Error(`${this.name} plugin is already rendered`)
    }
    this.iframe.setAttribute('sandbox', 'allow-popups allow-scripts allow-same-origin allow-forms allow-top-navigation')
    this.iframe.setAttribute('seamless', 'true')
    this.iframe.src = transformUrl(this.profile.url)
    // Wait for the iframe to load and handshake
    this.iframe.onload = async () => {
      if (!this.iframe.contentWindow) {
        throw new Error(`${this.name} plugin is cannot find url ${this.profile.url}`)
      }
      this.origin = new URL(this.iframe.src).origin
      this.source = this.iframe.contentWindow
      window.addEventListener(...this.listener)
      this.handshake()
    }
    return this.iframe
  }
}
