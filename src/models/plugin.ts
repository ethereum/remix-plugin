import { PostMessage } from './../post-message'
export interface JsonPlugin {
  title: string
  url?: string
  hash?: string
  version?: number
  imports: {
    type: string
    key: string
  }[],
  exports: {
    notifications: {
      action: 'notification'
      key: string
      params?: string[]
      permissioned: boolean
    }[]
    requests: {
      action: 'request'
      key: string
      params?: string[]
      permissioned: boolean
    }[]
  }
}

function PluginAPIFactory(plugin: JsonPlugin, messenger: PostMessage) {
  const notifs = plugin.exports.notifications.reduce(
    (acc, { key, params }) => ({
      ...acc,
      [key]: (parameters: typeof params) => console.log('notifs')

    }),
    {},
  )

  const requests = plugin.exports.requests.reduce(
    (acc, { key, params }) => ({
      ...acc,
      [key]: (parameters: typeof params, cb: Function) => {
        messenger.send(
          {
            action: 'request',
            key,
            type: plugin.title,
            value: parameters,
          },
          plugin.url,
        )
      },
    }),
    {},
  )

  const { title, url, hash, version } = plugin
  return {
    title,
    url,
    hash,
    version,
    notifs,
    requests,
  }
}
