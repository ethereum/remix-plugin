import { Plugin } from './abstract'
import { Profile } from '../../../utils'

export abstract class HostPlugin extends Plugin {

  constructor(profile: Profile) {
    super({...profile, methods: [ ...profile.methods, 'focus', 'addView', 'removeView'] })
  }

  /** Display the view inside the host */
  abstract focus(name: string): void

  /** Add the view of a plugin into the DOM */
  abstract addView(profile: Profile, view: Element): void

  /** Remove the plugin from the view from the DOM */
  abstract removeView(profile: Profile): void
}