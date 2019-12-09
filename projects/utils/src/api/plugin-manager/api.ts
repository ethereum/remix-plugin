import { StatusEvents, Profile } from '../../types'

export interface IPluginManager {
  events: {
    profileUpdated(profile: Profile): void
    profileAdded(profile: Profile): void
    profileRemoved(name: string): void
    pluginDeactivated(profile: Profile): void
    pluginActivated(profile: Profile): void
  } & StatusEvents
  methods: {
    getProfile(name: string): Promise<Profile>
    updateProfile(profile: Partial<Profile>): any
    activatePlugin(name: string): any
    deactivatePlugin(name: string): any
  }
}
