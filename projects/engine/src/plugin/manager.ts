import { Profile } from "../../../utils"
import { Plugin } from "./abstract"

export type IPluginManager = {
  // Exposed methods
  getProfile(name: string): Promise<Profile>
  updateProfile(profile: Partial<Profile>): any
  activatePlugin(name: string): any
  deactivatePlugin(name: string): any
  // Internal
  isActive(name: string): Promise<boolean>
  toggleActive(name: string): any
  addProfile(profile: Partial<Profile>): any
  removeProfile(name: string): any
  canCall(from: Profile, to: Profile, method: string): Promise<boolean>
  canActivate(from: Profile, to: Profile): Promise<boolean>
} & Plugin

export class PluginManager extends Plugin implements IPluginManager {
  protected profiles: Record<string, Profile>
  protected actives: string[] = []
  public methods = ['getProfile', 'updateProfile', 'activate', 'deactivate']

  protected onPluginActivated?(name: string): any
  protected onPluginDeactivated?(name: string): any
  protected onProfileAdded?(profile: Profile): any
  protected onProfileRemoved?(name: string): any

  constructor(profile: Profile) {
    super(profile)
  }

  /**
   * Get the profile if it exists
   * @param name The name of the plugin
   * @note This method can be overrided
   */
  async getProfile(name: string) {
    return this.profiles[name]
  }

  /**
   * Update the profile of the plugin
   * @param profile The Updated version of the plugin
   * @note Only the caller plugin should be able to update its profile
   */
  updateProfile(profile: Partial<Profile>) {
    if (profile.name !== this.currentRequest.from) {
      throw new Error('A plugin cannot update the profile of another one.')
    }
    if (!this.profiles[profile.name]) {
      throw new Error(`Plugin ${profile.name} is not register, you cannot update it's profile.`)
    }
    if (profile['url'] && profile['url'] !== this.profiles[profile.name]['url']) {
      throw new Error('Url from Profile cannot be updated.')
    }
    this.profiles[profile.name] = {
      ... this.profiles[profile.name],
      ...profile
    }
    this.emit('profileUpdated', this.profiles[profile.name])
  }

  /**
   * Add a profile to the list of profile
   * @param profile The profile to add
   * @note This method should only be used by the engine
   */
  addProfile(profile: Profile) {
    if (this.profiles[profile.name]) {
      throw new Error(`Plugin ${profile.name} already exist`)
    }
    this.profiles[profile.name] = profile
    this.emit('profileAdded', profile)
    if (this.onProfileAdded) {
      this.onProfileAdded(profile)
    }
  }

  /**
   * Remove a profile from the list
   * @param name The name of the profile to remove
   */
  removeProfile(name: string) {
    delete this.profiles[name]
    this.emit('profileRemoved', name)
    if (this.onProfileRemoved) {
      this.onProfileRemoved(name)
    }
  }

  /**
   * Verify if a plugin is currently active
   * @param name Name of the plugin
   */
  async isActive(name: string) {
    return this.actives.includes(name)
  }

  /**
   * Check if caller can activate plugin and activate it if authorized
   * @param name The name of the plugin to activate
   */
  async activatePlugin(name: string) {
    const isActive = await this.isActive(name)
    if (isActive) return
    const [ to, from ] = await Promise.all([
      this.getProfile(this.currentRequest.from),
      this.getProfile(name)
    ])
    const canActivate = await this.canActivate(from, to)
    if (canActivate) {
      await this.toggleActive(name)
    } else {
      throw new Error(`Plugin ${this.currentRequest.from} has no right to activate plugin ${name}`)
    }
  }

  /**
   * Check if caller can deactivate plugin and deactivate it if authorized
   * @param name The name of the plugin to activate
   */
  async deactivatePlugin(name: string) {
    const isActive = await this.isActive(name)
    if (!isActive) return
    const [ to, from ] = await Promise.all([
      this.getProfile(this.currentRequest.from),
      this.getProfile(name)
    ])
    const canDeactivate = await this.canDeactivate(from, to)
    if (canDeactivate) {
      await this.toggleActive(name)
    } else {
      throw new Error(`Plugin ${this.currentRequest.from} has no right to deactivate plugin ${name}`)
    }
  }

  /**
   * Activate or deactivate by bypassing permission
   * @param name The name of the plugin to activate
   * @note This method should ONLY be used by the engine
   * @note This method can be override
   */
  async toggleActive(name: string) {
    const isActive = await this.isActive(name)
    if (isActive) {
      this.actives = this.actives.filter(pluginName => pluginName !== name)
      this.emit('pluginDeactivated', name)
      if (this.onPluginDeactivated) {
        this.onPluginDeactivated(name)
      }
    } else {
      this.actives.push(name)
      this.emit('pluginActivated', name)
      if (this.onPluginActivated) {
        this.onPluginActivated(name)
      }
    }
  }

  /**
   * Check if a plugin can activate another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @note This method should be overrided
   */
  async canActivate(from: Profile, to: Profile) {
    return true
  }

  /**
   * Check if a plugin can deactivate another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @note This method should be overrided
   */
  async canDeactivate(from: Profile, to: Profile) {
    return false
  }

  /**
   * Check if a plugin can call a method of another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @param method Method targetted by the caller
   */
  async canCall(from: Profile, to: Profile, method: string) {
    return true
  }

}


