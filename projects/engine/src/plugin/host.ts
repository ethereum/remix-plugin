import { Plugin } from './abstract'
import { HostProfile, Profile } from '../../../utils'


interface ProfileMap {
  [name: string]: Profile
}

// @todo: Use an EntityStore<Element>
export abstract class HostPlugin extends Plugin {

  protected entities: ProfileMap = {}
  protected active: string

  constructor(public profile: HostProfile) {
    super(profile)
  }

  /** Display the view inside the host */
  abstract focus(name: string): void

  /** Add the view of a plugin into the DOM */
  abstract addView(profile: Profile, view: Element): void

  /** Remove the plugin from the view from the DOM */
  abstract removeView(name: string): void

  // /** Display the view inside the host */
  // async focus(name: string) {
  //   if (!this.entities[name]) {
  //     throw new Error(`Cannot display plugin ${name}. It's not activated yet, or not a "view" plugin.`)
  //   }
  //   this.active = name
  //   await this.onFocus(this.entities[name], name)
  //   this.emit('viewFocused', name)
  // }

  // /** Add the view of a plugin into the DOM */
  // async addView(profile: Profile, view: Element) {
  //   this.entities[name] = profile
  //   await this.onViewAdded(view, profile)
  //   this.emit('viewAdded', profile)
  // }

  // /** Remove the plugin from the view from the DOM */
  // async removeView(name: string) {
  //   const view = this.entities[name]
  //   const profile = { ...this.entities[name] }
  //   delete this.entities[name] // Deleting "this.views[name]" here doesn't delete "view"
  //   await this.onViewRemoved(view, profile)
  //   this.emit('viewRemoved', name)
  // }

  // /** Use this function to add the view into the DOM */
  // abstract onViewAdded(view: Element, profile: Profile): void | Promise<void>
  // /** Use this function to remove the view from the DOM */
  // abstract onViewRemoved(view: Element, profile: Profile): void | Promise<void>
  // /** Use this function to change the current view display */
  // abstract onFocus(view: Element, profile: Profile): void | Promise<void>
}