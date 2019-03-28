import { PluginProfile, Api, ModuleProfile, DefaultProfile } from "./types"

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


export const defaultProfile: DefaultProfile = {
  events: ['statusChanged'],
  notifications: {
    'theme': ['switchTheme']
  }
}

export function createProfile<
    T extends Api,
    Profile extends ModuleProfile<T> | PluginProfile<T>
  >(pluginProfile: Profile): Profile {
  const profile = { ...pluginProfile }

  // NOTIFICATIONS
  const notificationsKeys = Object.keys(defaultProfile.notifications)
  if (notificationsKeys.includes(profile.name)) {
    throw new Error(`${profile.name} is a reserved keyword, please use another name for your plugin`)
  }

  if (!profile.notifications) profile.notifications = {}
  notificationsKeys.forEach(service => {
    if (profile.notifications[service]) {
      throw new Error(`${profile.name} plugin should not listen on ${service}. This is a reserved keyword`)
    }
    profile.notifications = {
      ...profile.notifications,
      [service]: services[service]
    }
  })

  // EVENTS
  if (profile.events) {
    defaultProfile.events
      .filter(event => profile.events.includes(event))
      .forEach(event => console.log(`Event ${event} of plugin ${profile.name} is a default event, your cannot override it.`))
  }
  profile.events = [ ...(profile.events || []), ...defaultProfile.events ]

  return profile
}