import { Message, ModuleProfile, Api, ExtractKey } from "../types"
import { PluginOptions, PluginStore } from './plugin.store'

////////////////////////
// MESSAGE MANAGEMENT //
////////////////////////


function startListening(store: PluginStore) {

  async function getMessage(event) {
    if (!event.source) throw new Error('No source')

    // Check that the origin is the right one
    const devMode = store.get('devMode')
    const pluginOrigin = store.get('origin')
    if (!checkOrigin(event.origin, pluginOrigin, devMode)) return

    // Get the data
    if (!event.data) throw new Error('No data')
    const { action, key, name, payload, id, requestInfo, error } = event.data as Message

    try {
      // If handshake set loaded
      if (action === 'request' && key === 'handshake') {
        const { source, origin } = event
        store.update({ source, origin, isLoaded: true })
        // TODO: Manage handshake
        if (this.handshake) {
          this.handshake()
        }
        return
      }

      // Check if is loaded
      if (!store.get('isLoaded')) throw new Error('Handshake before communicating')

      if (action === 'notification') {
        const notifications = store.get('notifications')
        if (notifications[name] && notifications[name][key]) {
          notifications[name][key](...payload)
        }
      } else if (action === 'response') {
        const requests = store.get('pendingRequests')
        if (requests[id]) {
          requests[id](payload, error)
          store.removeRequest(id)
        }
      } else if (action === 'request') {
        if (!this[key]) {
          throw new Error(`Method ${key} doesn't exist on ${name}`)
        }
        store.update({ currentRequest: requestInfo })
        // TODO: call method attached to the plugin
        const result = await this[key](...payload)
        send.call(store, {action, name, key, id, payload: result})
      }
    } catch (err) {
      const message = { action, name, key, id, error: err.error };
      (<Window>event.source).postMessage(message, event.origin)
    }
  }

  window.addEventListener('message', getMessage, false)
}


/**
 * Check if the sender has the right origin
 * @param msgOrigin The origin of the incoming message
 * @param pluginOrigin The current plugin
 * @param devMode Devmode options
 */
function checkOrigin(msgOrigin: string, pluginOrigin, devMode?) {
  const localhost = devMode ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  return pluginOrigin
    ? pluginOrigin === msgOrigin
    : [
      "http://remix-alpha.ethereum.org",
      "http://remix.ethereum.org",
      "https://remix-alpha.ethereum.org",
      "https://remix.ethereum.org",
      ...localhost
    ].includes(msgOrigin)
}

///////////
/// API ///
///////////

type EventApi<T extends Api> = {
  [event in keyof T['events']]: T['events'][event]
}
type MethodApi<T extends Api> = {
  [method in ExtractKey<T, Function>]: T[method]
}
type CustomApi<T extends Api> = EventApi<T> & MethodApi<T>

/**
 * Create an Api
 * @param profile The profile of the api
 */
function createApi<T extends Api>(plugin: PluginClient, profile: ModuleProfile<T>): CustomApi<T> {
  const events = profile.events.reduce((acc, event) => ({
    ...acc,
    [event]: plugin.listen.bind(plugin, profile.name, event)
  }), {} as EventApi<T>)
  const methods = profile.methods.reduce((acc, method) => ({
    ...acc,
    [method]: plugin.call.bind(plugin, profile.name, method)
  }), {} as MethodApi<T>)
  return { ...events, ...methods }
}

/** Add one API to the current Plugin */
function addApi<T extends Api, Parent extends PluginClient>(this: Parent, profile: ModuleProfile<T>): typeof this & CustomApi<T> {
  return { ...this, ...createApi(this, profile) }
}

//////////
// PLUGIN //
//////////


/** Call a method from another plugin or module */
function callMethod(this: PluginStore, name: string, key: string, ...payload: any): Promise<any> {
  const action = 'request'
  const id = this.get('id') + 1
  this.update({ id })
  return new Promise((res, rej) => {
    const pendingRequest = (result: any, error?: Error) => {
      if (error) rej(new Error(`Error from IDE : ${error}`))
      res(result)
    }
    this.addRequest(id, pendingRequest)
    send.call(this, { action, name, key, payload, id })
  })
}

/** Listen on notification events from another plugin or module */
function listen(this: PluginStore, name: string, key: string, cb: (...payload: any[]) => void) {
  this.addNotification(name, key, cb)
}


/** Send a message to source parent */
function send(this: PluginStore, message: Partial<Message>) {
  const { source, origin, devMode } = this.get()
  if (!source || !origin) {
    const devmode = devMode
    ? `Make sure the port of the IDE is ${devMode.port}`
    : 'If you are using a local IDE, make sure to add devMode: extension.setDevMode(idePort)'
    throw new Error(`Not connected to the IDE. ${devmode}`)
  }
  source.postMessage(message, origin)
}


interface PluginClient {
  call: typeof callMethod
  listen: typeof listen
  addApi: typeof addApi
}

/**
 * Create a plugin
 * @param options Options of the plugin
 */
export function createPlugin(options?: PluginOptions): PluginClient {
  const store = new PluginStore(options)
  startListening(store)
  return {
    call: callMethod.bind(store),
    addApi: addApi.bind(store),
    listen: listen.bind(store),
    // TODO : add method / event to expose to other plugins
  }
}
