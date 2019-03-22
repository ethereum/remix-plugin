import { PluginProfile } from "../src"
import { Plugin } from '../src/engine/plugin'
import { services as serviceMap } from '../src/services'

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

  test('Should add services in notifications', () => {
    const plugin = new Plugin(NormalProfile)
    if (!plugin.profile.notifications) throw new Error('notifications should be defined')
    const notifications = Object.keys(plugin.profile.notifications)
    const services = Object.keys(serviceMap)
    const notificationsHasAllServices = services.every(service => notifications.includes(service))
    expect(notificationsHasAllServices).toBe(true)
  })
})