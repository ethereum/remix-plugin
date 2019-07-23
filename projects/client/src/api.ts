import { PluginClient, PluginOptions } from './client'
import { Profile, Api, MethodApi, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap, Theme } from '../../utils'

/**
 * Create an Api
 * @param profile The profile of the api
 */
export function createApi<T extends Api>(client: PluginClient<any, any>, profile: Profile<T>): CustomApi<T> {
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
  client: PluginClient<any, App>,
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



/** Start listening on theme changed */
export async function listenOnThemeChanged(client: PluginClient<any, any>, options?: Partial<PluginOptions<any>>) {
  if (options && options.customTheme) return
  const cssLink = document.createElement('link')
  cssLink.setAttribute('rel', 'stylesheet')
  document.head.appendChild(cssLink)
  client.onload(async () => {
    client.on('theme', 'themeChanged', (_theme: Theme) => setTheme(cssLink, _theme))
    const theme = await client.call('theme', 'currentTheme')
    setTheme(cssLink, theme)
  })
  return cssLink
}

function setTheme(cssLink: HTMLLinkElement, theme: Theme) {
  console.log('setTheme', cssLink, theme)
  cssLink.setAttribute('href', theme.url)
  document.documentElement.style.setProperty('--theme', theme.quality)
}