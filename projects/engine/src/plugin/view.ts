import { Plugin } from './abstract'
import { Profile, ViewProfile } from '../../../utils'


export function isView<P extends Profile>(profile: Profile): profile is (ViewProfile & P) {
  return !!profile['location']
}

export abstract class ViewPlugin extends Plugin {
  abstract render(): Element

  constructor(public profile: ViewProfile) {
    super(profile)
  }

  activate() {
    this.call(this.profile.location, 'addHost', this.name, this.render())
    super.activate()
  }

  deactivate() {
    this.call(this.profile.location, 'removeHost', this.name)
  }
}