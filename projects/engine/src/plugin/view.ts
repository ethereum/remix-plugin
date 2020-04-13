import { Plugin } from './abstract'
import { Profile, LocationProfile } from '../../../utils'


export function isView<P extends Profile>(profile: Profile): profile is (ViewProfile & P) {
  return !!profile['location']
}

export type ViewProfile = Profile & LocationProfile

export abstract class ViewPlugin extends Plugin {
  abstract render(): Element

  constructor(public profile: ViewProfile) {
    super(profile)
  }

  async activate() {
    await this.call(this.profile.location, 'addView', this.profile, this.render())
    super.activate()
  }

  deactivate() {
    this.call(this.profile.location, 'removeView', this.profile)
    super.deactivate()
  }
}