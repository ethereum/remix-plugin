import type { Message, Api, ApiMap, PluginApi } from '@remixproject/plugin-utils'
import {
  ClientConnector,
  connectClient,
  applyApi,
  PluginClient,
  isHandshake,
  PluginOptions,
  checkOrigin,
  isPluginMessage
} from '@remixproject/plugin'
import { RemixApi, Theme } from '@remixproject/plugin-api';


/** Transform camelCase (JS) text into kebab-case (CSS) */
function toKebabCase(text: string) {
  return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

declare global {
  function acquireTheiaApi(): any;
}


/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  source: { postMessage: (message: any, origin?: string) => void }
  origin: string
  isVscode: boolean

  constructor(private options: PluginOptions<any>) {
    // @todo(#295) check if we can merge this statement in `this.isVscode = acquireVsCodeApi !== undefined`
    try {
      this.isVscode = acquireTheiaApi !== undefined
      this.source = acquireTheiaApi()
      return
    } catch (e) {
      this.isVscode = false
    }
    // fallback to window parent (iframe)
    this.source = window.parent
  }


  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.isVscode) {
      this.source.postMessage(message)
    } else if (this.origin || isHandshake(message)) {
      const origin = this.origin || '*'
      this.source.postMessage(message, origin)
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    window.addEventListener('message', async (event: MessageEvent) => {
      if (!event.source) return
      if (!event.data) return
      if (!isPluginMessage(event.data)) return
      // Support for iframe
      if (!this.isVscode) {
        // Check that the origin is the right one (if any defined in the options)
        const isGoodOrigin = await checkOrigin(event.origin, this.options)
        if (!isGoodOrigin) return console.warn('Origin provided is not allow in message', event)
        if (isHandshake(event.data)) {
          this.origin = event.origin
          this.source = event.source as Window
          if(event.data.payload[0] && event.data.payload[0].engine && event.data.payload[0].engine == 'vscode') this.forwardKeyBoardEvents()
        }
      }
      cb(event.data)

    }, false)
  }

  // vscode specific, webview iframe requires forwarding of keyboard events
  forwardKeyBoardEvents(){
    document.addEventListener('keydown', e => {
        const obj = {
            altKey: e.altKey,
            code: e.code,
            ctrlKey: e.ctrlKey,
            isComposing: e.isComposing,
            key: e.key,
            location: e.location,
            metaKey: e.metaKey,
            repeat: e.repeat,
            shiftKey: e.shiftKey,
            action: 'keydown'
        }
        window.parent.postMessage( obj, '*')
    })
  }

}

/**
 * Connect a Webview plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createClient = <
  P extends Api = any,
  App extends ApiMap = RemixApi,
  C extends PluginClient<P, App> = any
>(client: C): C & PluginApi<App> => {
  const c = client as any || new PluginClient<P, App>()
  const options = c.options
  const connector = new WebviewConnector(options)
  connectClient(connector, c)
  applyApi(c)
  if (!options.customTheme) {
    listenOnThemeChanged(c)
  }
  return c as any
}

/** Set the theme variables in the :root */
function applyTheme(theme: Theme) {
  const brightness = theme.brightness || theme.quality;
  document.documentElement.style.setProperty(`--brightness`, brightness);
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      document.documentElement.style.setProperty(`--${toKebabCase(key)}`, value);
    }
  }
  if (theme.breakpoints) {
    for (const [key, value] of Object.entries(theme.breakpoints)) {
      document.documentElement.style.setProperty(`--breakpoint-${key}`, `${value}px`);
    }
  }
  if (theme.fontFamily) {
    document.documentElement.style.setProperty(`--font-family`, theme.fontFamily);
  }
  if (theme.space) {
    document.documentElement.style.setProperty(`--space`, `${theme.space}px`);
  }
}

/** Start listening on theme changed */
async function listenOnThemeChanged(client: PluginClient) {
  let cssLink: HTMLLinkElement;
  // Memorized the css link but only create it when needed
  const getLink = () => {
    if (!cssLink) {
      cssLink = document.createElement('link')
      cssLink.setAttribute('rel', 'stylesheet')
      document.head.prepend(cssLink)
    }
    return cssLink;
  }

  // If there is a url in the theme, use it
  const setLink = (theme: Theme) => {
    if (theme.url) {
      getLink().setAttribute('href', theme.url)
      document.documentElement.style.setProperty('--theme', theme.quality)
    }
  }

  client.onload(async () => {
    // On Change
    client.on('theme', 'themeChanged', (theme: Theme) => {
      setLink(theme);
      applyTheme(theme);
    })
    // Initial load
    const theme = await client.call('theme', 'currentTheme')
    setLink(theme);
    applyTheme(theme);
  })
  return cssLink
}

