import { PluginClient, PluginOptions } from './client'
import { Profile, Api, MethodApi, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap } from '@utils'

/**
 * Create an Api
 * @param profile The profile of the api
 */
export function createApi<T extends Api>(client: PluginClient, profile: Profile<T>): CustomApi<T> {
  if (typeof profile.name !== 'string') {
    throw new Error('Profile should have a name')
  }
  const on = <event extends Extract<keyof T['events'], string>>(event: event, cb: T['events'][event]) => {
    client.on.call(client, profile.name, event, cb)
  }

  const methods = (profile.methods || []).reduce((acc, method) => ({
    ...acc,
    [method]: client.call.bind(client, profile.name, method)
  }), {} as MethodApi<T>)
  return { on, ...methods }
}


/** Transform a list of profile into a map of API */
export function getApiMap<T extends ProfileMap<App>, App extends ApiMap>(
  client: PluginClient,
  profiles: T
): PluginApi<ApiMapFromProfileMap<T>> {
  return Object.keys(profiles).reduce((acc, name) => {
    const profile = profiles[name] as Profile<Api>
    return { ...acc, [name]: createApi(client, profile ) }
  }, {} as PluginApi<ApiMapFromProfileMap<T>>)
}


////////////////
// COMMON API //
////////////////

export interface Theme {
  url: string
  quality: 'dark' | 'light'
}

/** Start listening on theme changed */
export function listenOnThemeChanged(client: PluginClient, options?: Partial<PluginOptions<any>>) {
  if (options && options.customTheme) return
  const cssLink = document.createElement('link')
  cssLink.setAttribute('rel', 'stylesheet')
  document.head.appendChild(cssLink)
  // Theme changed
  client.on('theme', 'themeChanged', (theme: Theme) => {
    setTheme(cssLink, theme)
  })
  // When client is loaded, get the current Theme
  client.onload(async () => {
    const theme = await client.call('theme', 'currentTheme')
    setTheme(cssLink, theme)
  })
  return cssLink
}

function setTheme(cssLink: HTMLLinkElement, theme: Theme) {
  cssLink.setAttribute('href', theme.url)
  document.documentElement.style.setProperty('--theme', theme.quality)
}