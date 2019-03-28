import { PluginProfile } from "../src"
import { Plugin } from '../src/engine/plugin'
import { defaultProfile } from '../src/profile'

const ThemeProfile: PluginProfile<any> = {
  name: 'theme',
  url: ''
}

const NormalProfile: PluginProfile<any> = {
  name: 'normal',
  url: ''
}

describe('Keywords', () => {
  test('Should warn not to use keyword', () => {
    try {
      const plugin = new Plugin(ThemeProfile)
    } catch (err) {
      expect(err.message).toMatch(`${ThemeProfile.name} is a reserved keyword, please use another name for your plugin`)
    }
  })

  test('Should add default notifications in profile notifications', () => {
    const plugin = new Plugin(NormalProfile)
    if (!plugin.profile.notifications) throw new Error('notifications should be defined')
    const notifications = Object.keys(plugin.profile.notifications)
    const defaults = Object.keys(defaultProfile.notifications)
    const notificationsHasAllDefault = defaults.every(notif => notifications.includes(notif))
    expect(notificationsHasAllDefault).toBe(true)
  })
})