import { PluginClient, PluginOptions } from './client'
import { ModuleProfile, Api, ExtractKey } from 'src/types'

///////////
/// API ///
///////////

// Get the events of the Api
type EventApi<T extends Api> = {
  [event in keyof T['events']]: T['events'][event]
}
// Get the methods of the Api
type MethodApi<T extends Api> = {
  [method in ExtractKey<T, Function>]: T[method]
}
type CustomApi<T extends Api> = EventApi<T> & MethodApi<T>

// Extract an Api based on its profile and name
export type ExtractApi<Profile, name> = Profile extends ModuleProfile<infer X>
  ? name extends Profile['name'] ? X : never
  : never
// Create a map out of a union of Api
export type ApiMap<M extends ModuleProfile<Api>> = {
  [name in M['name']]: CustomApi<ExtractApi<M, name>>
}

/**
 * Create an Api
 * @param profile The profile of the api
 */
function createApi<T extends Api>(client: PluginClient, profile: ModuleProfile<T>): CustomApi<T> {
  const events = profile.events.reduce((acc, event) => ({
    ...acc,
    [event]: client.on.bind(client, profile.name, event)
  }), {} as EventApi<T>)
  const methods = profile.methods.reduce((acc, method) => ({
    ...acc,
    [method]: client.call.bind(client, profile.name, method)
  }), {} as MethodApi<T>)
  return { ...events, ...methods }
}


/** Transform a list of profile into a map of API */
export function getApiMap<T extends ModuleProfile>(client: PluginClient, profiles: T[]): ApiMap<T> {
  return profiles.reduce((acc, profile) => {
    if (!profile.name) throw new Error('A profile need a name to be used as API')
    return {...acc, [profile.name]: createApi(client, profile) }
  }, {} as ApiMap<T>)
}


////////////////
// COMMON API //
////////////////

export interface Theme {
  url: string
  quality: 'dark' | 'light'
}

/** Start listening on theme changed */
export function listenOnThemeChanged(client: PluginClient, options: PluginOptions) {
  if (options.customTheme) return
  const cssLink = document.createElement('link')
  cssLink.setAttribute('rel', 'stylesheet')
  document.head.appendChild(cssLink)
  client.on('theme', 'themeChanged', (theme: Theme) => {
    cssLink.setAttribute('href', theme.url)
    document.documentElement.style.setProperty('--theme', theme.quality)
  })
}