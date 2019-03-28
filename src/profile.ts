import { Api, ModuleProfile, DefaultProfile } from "./types"

export const defaultProfile: DefaultProfile = {
  events: ['statusChanged'],
  notifications: {
    'theme': ['switchTheme']
  }
}

export function createProfile<T extends Api>(pluginProfile: ModuleProfile<T>) {
  const profile = { ...pluginProfile }

  // NOTIFICATIONS
  const notificationsKeys = Object.keys(defaultProfile.notifications)
  if (notificationsKeys.includes(profile.name)) {
    throw new Error(`${profile.name} is a reserved keyword, please use another name for your plugin`)
  }

  if (!profile.notifications) profile.notifications = {}
  notificationsKeys.forEach(notif => {
    if (profile.notifications[notif]) {
      throw new Error(`${profile.name} plugin should not listen on ${notif}. This is a reserved keyword`)
    }
    profile.notifications = {
      ...profile.notifications,
      [notif]: defaultProfile[notif]
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