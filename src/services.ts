import { PluginProfile, Api } from "./types"

export const services = {
  'theme': ['switchTheme']
}

export function addServices<T extends Api>(pluginProfile: PluginProfile<T>) {
  const serviceKeys = Object.keys(services)
  const profile = {...pluginProfile}
  if (serviceKeys.includes(profile.name)) {
    throw new Error(`${profile.name} is a reserved keyword, please use another name for your plugin`)
  }

  if (!profile.notifications) profile.notifications = {}
  serviceKeys.forEach(service => {
    if (profile.notifications[service]) {
      throw new Error(`${profile.name} plugin should not listen on ${service}. This is a reserved keyword`)
    }
    profile.notifications = {
      ...profile.notifications,
      [service]: services[service]
    }
  })
  return profile
}
