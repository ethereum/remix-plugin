import { Plugin } from './abstract'
import { HostProfile } from '../../../utils'


interface ViewMap {
  [name: string]: Element
}

// @todo: Use an EntityStore<Element>
export abstract class HostPlugin extends Plugin {

  protected entities: ViewMap = {}
  protected active: string

  constructor(public profile: HostProfile) {
    super(profile)
  }

  /** Display the view inside the host */
  async focus(name: string) {
    if (!this.entities[name]) {
      throw new Error(`Cannot display plugin ${name}. It's not activated yet, or not a "view" plugin.`)
    }
    this.active = name
    await this.onFocus(this.entities[name], name)
    this.emit('viewFocused', name)
  }

  /** Add the view of a plugin into the DOM */
  async addView(name: string, view: Element) {
    this.entities[name] = view
    await this.onViewAdded(view, name)
    this.emit('viewAdded', name)
  }

  /** Remove the plugin from the view from the DOM */
  async removeView(name: string) {
    const view = this.entities[name]
    delete this.entities[name] // Deleting "this.views[name]" here doesn't delete "view"
    await this.onViewRemoved(view, name)
    this.emit('viewRemoved', name)
  }

  /** Use this function to add the view into the DOM */
  abstract onViewAdded(view: Element, name: string): void | Promise<void>
  /** Use this function to remove the view from the DOM */
  abstract onViewRemoved(view: Element, name: string): void | Promise<void>
  /** Use this function to change the current view display */
  abstract onFocus(view: Element, name: string): void | Promise<void>
}