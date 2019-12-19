import { Plugin } from './abstract'
import { Api, Profile, LibraryProfile, LocationProfile } from '../../../utils'

export type LibraryApi<T extends Api, P extends Profile> = {
  [method in P['methods'][number]]: T['methods'][method]
} & {
  events: {
    on: (name: string, cb: (...args: any[]) => void) => void
    once?: (name: string, cb: (...args: any[]) => void) => void
    off?: (name: string) => void
    emit: (name: string, ...args: any[]) => void
  }
} & {
  render?(): Element
}

type LibraryViewProfile = Profile & LocationProfile & LibraryProfile

export function isViewLibrary(profile): profile is LibraryViewProfile {
  return !!profile.location
}

export class LibraryPlugin<
  T extends Api = any,
  P extends LibraryViewProfile = any
> extends Plugin {

  private isView: boolean

  constructor(protected library: LibraryApi<T, P>, public profile: P) {
    super(profile)
    profile.methods.forEach(method => {
      if (!library[method]) {
        throw new Error(`Method ${method} is exposed by LibraryPlugin ${profile.name}. But library doesn't expose this method`)
      }
    })
    this.isView = isViewLibrary(profile)
    if (this.isView && !this['render']) {
      throw new Error(`Profile ${profile.name} define the location ${profile.location}, but method "render" is not implemented`)
    }
  }

  async activate() {
    if (this.isView) {
      await this.call(this.profile.location, 'addView', this.profile, this['render']())
    }
    super.activate()
    // Forward event to the library
    if (this.profile.notifications) {
      if (!this.library.events || !this.library.events.emit) {
        throw new Error(`"events" object from Library of plugin ${this.name} should implement "emit"`)
      }
      Object.keys(this.profile.notifications).forEach(name => {
        this.profile.notifications[name].forEach(key => {
          this.on(name, key, (payload: any[]) => this.library.events.emit(`[${name}] ${key}`, ...payload))
        })
      })
    }
    // Start listening on events from the library
    if (this.profile.events) {
      if (!this.library.events || !this.library.events.emit) {
        throw new Error(`"events" object from Library of plugin ${this.name} should implement "emit"`)
      }
      this.profile.events.forEach(event => {
        this.library.events.on(event, (...payload) => this.emit(event, ...payload))
      })
    }
  }

  deactivate() {
    if (this.isView) {
      this.call(this.profile.location, 'removeView', this.profile)
    }
    // Stop listening on events
    if (this.profile.notifications) {
      Object.keys(this.profile.notifications).forEach(name => {
        this.profile.notifications[name].forEach(key => this.off(name, key))
      })
    }
    // Stop listening on events from the library
    if (this.profile.events && this.library.events.off) {
      this.profile.events.forEach(event => this.library.events.off(event))
    }
    super.deactivate()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[]) {
    if (!this.library[key]) {
      throw new Error(`LibraryPlugin ${this.name} doesn't expose method ${key}`)
    }
    return this.library[key](...payload)
  }
}
