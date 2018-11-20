import {
  CompilationResult,
  Tx,
  RequestTypes,
  RequestKeys,
  EventListener,
  PluginList,
  PluginDesc,
  OriginList,
  RequestMsg,
} from '../models'

import { EventManager } from 'remix-lib'
import { PluginAPI } from './pluginAPI'
import { PostMessage } from './../post-message'

/**
 * Register and Manage plugin:
 *
 * Plugin registration is done in the settings tab,
 * using the following format:
 * {
 *  "title": "<plugin name>",
 *  "url": "<plugin url>"
 * }
 *
 * structure of messages:
 *
 * - Notification sent by Remix:
 *{
 *  action: 'notification',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>
 *}
 *
 * - Request sent by the plugin:
 *{
 *  id: <number>,
 *  action: 'request',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>
 *}
 *
 * - Response sent by Remix and receive by the plugin:
 *{
 *  id: <number>,
 *  action: 'response',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>,
 *  error: (see below)
 *}
 * => The `error` property is `undefined` if no error happened.
 * => In case of error (due to permission, system error, API error, etc...):
 *            error: { code, msg (optional), data (optional), stack (optional)
 * => possible error code are still to be defined, but the generic one would be 500.
 *
 * Plugin receive 4 types of message:
 * - focus (when he get focus)
 * - unfocus (when he loose focus - is hidden)
 * - compilationData (that is triggered just after a focus - and send the current compilation data or null)
 * - compilationFinished (that is only sent to the plugin that has focus)
 *
 * Plugin can emit messages and receive response.
 *
 * CONFIG:
 * - getConfig(filename). The data to send should be formatted like:
 *    {
 *      id: <requestid>,
 *      action: 'request',
 *      key: 'config',
 *      type: 'getConfig',
 *      value: ['filename.ext']
 *    }
 *  the plugin will reveice a response like:
 *    {
 *      id: <requestid>,
 *      action: 'response',
 *      key: 'config',
 *      type: 'getConfig',
 *      error,
 *      value: ['content of filename.ext']
 *    }
 * same apply for the other call
 * - setConfig(filename, content)
 * - removeConfig
 *
 * See index.html and remix.js in test-browser folder for sample
 *
 */
export class PluginManager {
  private _components: { pluginAPI: PluginAPI }
  public event = new EventManager()
  public plugins: PluginList = {}
  public origins: OriginList = {}
  public inFocus = ''
  public messenger: PostMessage

  constructor(
    app: EventListener,
    compiler: EventListener,
    txlistener: EventListener,
    fileProviders: EventListener,
    fileManager: EventListener,
    udapp: EventListener,
    SourceHighlighter: any,
  ) {
    const pluginAPI = new PluginAPI(
      this,
      fileProviders,
      fileManager,
      compiler,
      udapp,
      SourceHighlighter,
    )

    this.messenger = new PostMessage(pluginAPI)

    this._components = { pluginAPI }
    fileManager.event.register(
      'currentFileChanged',
      (file: string, provider: object) => {
        this.messenger.broadcast({
          action: 'notification',
          key: 'editor',
          type: 'currentFileChanged',
          value: [file],
        })
      },
    )

    compiler.event.register(
      'compilationFinished',
      (
        success: boolean,
        data: CompilationResult['contracts'],
        source: CompilationResult['sources'],
      ) => {
        this.messenger.broadcast({
          action: 'notification',
          key: 'compiler',
          type: 'compilationFinished',
          value: [success, data, source],
        })
      },
    )

    txlistener.event.register('newTransaction', (tx: Tx) => {
      this.messenger.broadcast({
        action: 'notification',
        key: 'txlistener',
        type: 'newTransaction',
        value: [tx],
      })
    })

    app.event.register('tabChanged', (tabName: string) => {
      // TODO Fix this cause this event is no longer triggered
      if (this.inFocus && this.inFocus !== tabName) {
        // trigger unfocus
        this.messenger.send(
          {
            action: 'notification',
            key: 'app',
            type: 'unfocus',
            value: [],
          },
          this.inFocus,
        )
      }
      if (this.plugins[tabName]) {
        // trigger focus
        this.messenger.send(
          {
            action: 'notification',
            key: 'app',
            type: 'focus',
            value: [],
          },
          tabName,
        )
        this.inFocus = tabName
        // Get compilation result when tab change
        pluginAPI.compiler.getCompilationResult(
          tabName,
          (error: string, data: CompilationResult) => {
            if (!error) return
            this.messenger.send(
              {
                action: 'notification',
                key: 'compiler',
                type: 'compilationData',
                value: [data],
              },
              tabName,
            )
          },
        )
      }
    })
  }

  public unregister({title}: PluginDesc) {
    this._components.pluginAPI.editor.discardHighlight(title, () => {})
    this.messenger.removePlugin(title)
  }

  public register(desc: PluginDesc, modal: any, content: any) {
    this.messenger.addPlugin({ ...desc, content })
  }

  public receivedDataFrom(
    methodName: string,
    moduleName: string,
    argumentsArray: any,
  ) {
    // TODO check whether 'mod' as right to do that
    console.log(argumentsArray)
    this.event.trigger(methodName, argumentsArray)
  }

}
