import { ModuleProfile, Api, PluginProfile } from '../types'

type Profile<T extends Api> = ModuleProfile<T> | PluginProfile<T>

/**
 * Create a Profile with default values
 * @param profile The profile of the plugin
 * @param baseProfiles A list of profiles to mix in the base profile
 */
export function extendsProfile<T extends Api, U extends Api>(
  profile: Profile<T>,
  ...baseProfiles: ModuleProfile<U>[]
): Profile<T & U> {
  let baseProfile = {}
  if (baseProfiles.length > 1) {
    baseProfile = baseProfiles.reduce((acc, base) => extendsProfile(acc, base), {})
  } else if (baseProfiles.length === 1) {
    baseProfile = baseProfiles[0]
  }

  return {
    ...baseProfile,
    ...profile,
    methods: [
      ...baseProfiles.reduce((acc, base) => [ ...acc, ...(base.methods || []) ], []),
      ...(profile.methods || [])
    ],
    events: [
      ...baseProfiles.reduce((acc, base) => [ ...acc, ...(base.events || []) ], []),
      ...(profile.events || [])
    ],
    notifications: {
      ...baseProfiles.reduce((acc, base) => ({ ...acc, ...(base.notifications || {}) }), {} as any),
      ...(profile.notifications || {}),
    },
  }
}