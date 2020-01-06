import { Profile, pluginManagerProfile } from "../../../utils"
import { Plugin } from "./abstract"

export type BasePluginManager = {
  // Exposed methods
  getProfile(name: string): Promise<Profile>
  updateProfile(profile: Partial<Profile>): any
  activatePlugin(name: string): any
  deactivatePlugin(name: string): any
  // Internal
  isActive(name: string): Promise<boolean>
  toggleActive(name: string): any
  addProfile(profile: Partial<Profile>): any
  canCall(from: Profile, to: Profile, method: string): Promise<boolean>
  canActivate(from: Profile, to: Profile): Promise<boolean>
} & Plugin

export const managerMethods = ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin']

interface ManagerProfile extends Profile {
  name: 'manager',
}


export class PluginManager extends Plugin implements BasePluginManager {
  /** Run engine activation. Implemented by Engine */
  private engineActivatePlugin: (name: string) => Promise<any>
  /** Run engine deactivation. Implemented by Engine */
  private engineDeactivatePlugin: (name: string) => Promise<any>
  protected profiles: Record<string, Profile> = {}
  protected actives: string[] = []
  public methods = ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin']

  protected onPluginActivated?(profile: Profile): any
  protected onPluginDeactivated?(profile: Profile): any
  protected onProfileAdded?(profile: Profile): any

  constructor(profile: ManagerProfile = pluginManagerProfile) {
    super(profile)
    this.profiles[profile.name] = profile // Initialise with own profile (cannot use addProfile because manager is not activated yet)
  }

  /** Return the name of the caller. If no request provided, this mean that the method has been called from the IDE so we use "manager" */
  get requestFrom() {
    return this.currentRequest ? this.currentRequest.from : 'manager'
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
    if (profile.name !== this.requestFrom) {
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
  async activatePlugin(names: string | string[]) {
    const activate = async (name: string) => {
      const isActive = await this.isActive(name)
      if (isActive) return
      const [ to, from ] = await Promise.all([
        this.getProfile(name),
        this.getProfile(this.requestFrom)
      ])
      const canActivate = await this.canActivate(from, to)
      if (canActivate) {
        await this.toggleActive(name)
      } else {
        throw new Error(`Plugin ${this.requestFrom} has no right to activate plugin ${name}`)
      }
    }
    return Array.isArray(names) ? Promise.all(names.map(activate)) : activate(names)
  }

  /**
   * Check if caller can deactivate plugin and deactivate it if authorized
   * @param name The name of the plugin to activate
   */
  async deactivatePlugin(names: string | string[]) {
    const deactivate = async (name: string) => {
      const isActive = await this.isActive(name)
      if (!isActive) return
      const [ to, from ] = await Promise.all([
        this.getProfile(name),
        this.getProfile(this.requestFrom)
      ])
      const canDeactivate = await this.canDeactivate(from, to)
      if (canDeactivate) {
        await this.toggleActive(name)
      } else {
        throw new Error(`Plugin ${this.requestFrom} has no right to deactivate plugin ${name}`)
      }
    }
    return Array.isArray(names) ? Promise.all(names.map(deactivate)) : deactivate(names)
  }

  /**
   * Activate or deactivate by bypassing permission
   * @param name The name of the plugin to activate
   * @note This method should ONLY be used by the IDE
   */
  async toggleActive(names: string | string[]) {
    const toggle = async (name: string) => {
      const [isActive, profile] = await Promise.all([
        this.isActive(name),
        this.getProfile(name)
      ])
      if (isActive) {
        await this.engineDeactivatePlugin(name)
        this.actives = this.actives.filter(pluginName => pluginName !== name)
        this.emit('pluginDeactivated', profile)
        if (this.onPluginDeactivated) {
          this.onPluginDeactivated(profile)
        }
      } else {
        await this.engineActivatePlugin(name)
        this.actives.push(name)
        this.emit('pluginActivated', profile)
        if (this.onPluginActivated) {
          this.onPluginActivated(profile)
        }
      }
    }
    return Array.isArray(names) ? Promise.all(names.map(toggle)) : toggle(names)
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
    if (from.name === 'manager') {
      return true
    }
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


