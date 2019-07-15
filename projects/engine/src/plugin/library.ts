import { Plugin } from './abstract'
import { Api, Profile, LibraryProfile, ViewProfile } from '../../../utils'

export type LibraryApi<T extends Api, P extends Profile> = {
  [method in P['methods'][number]]: T['methods'][method]
} & {
  events: {
    on: (name: string, cb: (...args: any[]) => void) => void
    emit: (name: string, ...args: any[]) => void
  }
} & {
  render?(): Element
}

interface LibraryViewProfile extends Profile, LibraryProfile {
  location?: string
}

export function isViewLibrary(profile): profile is LibraryViewProfile {
  return !!profile.location
}

export class LibraryPlugin<
  T extends Api,
  P extends LibraryViewProfile
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
        throw new Error(`Library of plugin ${this.name} should listen on notifications.
        But doesn't expose the right interface (library.events.emit)`)
      }
      Object.keys(this.profile.notifications).forEach(name => {
        this.profile.notifications[name].forEach(key => {
          this.on(name, key, (payload) => this.library.events.emit(`[${name}] ${key}`, ...payload))
        })
      })
    }
    // Start listening on events from the library
    if (this.profile.events) {
      if (!this.library.events || !this.library.events.emit) {
        throw new Error(`Library of plugin ${this.name} should emit events but doesn't expose the right interface (library.events.emit)`)
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
