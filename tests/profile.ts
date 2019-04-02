import { PluginProfile, baseProfile } from "../src"
import { Plugin } from '../src/engine/plugin'

const NormalProfile: PluginProfile<any> = {
  name: 'normal',
  url: ''
}

describe('Profile', () => {

  test('[Default]: Should add default notifications in profile notifications', () => {
    const plugin = new Plugin(NormalProfile)
    if (!plugin.profile.notifications) throw new Error('notifications should be defined')
    const notifications = Object.keys(plugin.profile.notifications)
    const defaults = Object.keys(baseProfile.notifications)
    const notificationsHasAllDefault = defaults.every(notif => notifications.includes(notif))
    expect(notificationsHasAllDefault).toBe(true)
  })
})