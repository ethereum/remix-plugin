import { PluginConnector, PluginConnectorOptions} from '@remixproject/engine'
import { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils'
import { ExtensionContext, ViewColumn, Webview, WebviewPanel, window, Uri } from 'vscode'
import { join, isAbsolute, parse as parsePath } from 'path'
import { promises as fs, watch } from 'fs'
import { get } from 'https'
import { parse as parseUrl } from 'url'

interface WebviewOptions extends PluginConnectorOptions {
  /** Extension Path */
  context: ExtensionContext
  column?: ViewColumn
  devMode?: boolean
}

export class WebviewPlugin extends PluginConnector {
  panel?: WebviewPanel
  options: WebviewOptions

  constructor(profile: Profile & ExternalProfile, options: WebviewOptions) {
    super(profile)
    this.options = options
  }

  setOptions(options: Partial<WebviewOptions>) {
    super.setOptions(options)
  }

  protected send(message: Partial<Message>): void {
    if (this.panel) {
      this.panel.webview.postMessage(message)
    }
  }

  protected connect(url: string): void {
    if (this.options.context) {
      const { extensionPath } = this.options.context
      this.panel = createWebview(this.profile, url, extensionPath, this.options)
      this.panel.webview.onDidReceiveMessage(msg => this.getMessage(msg))
      this.options.context.subscriptions.push(this.panel)
    } else {
      throw new Error(`WebviewPlugin "${this.name}" `)
    }
  }

  protected disconnect(): void {
    if (this.panel) {
      this.panel.dispose()
    }
  }

}

function isHttpSource(protocol: string) {
  return protocol === 'https:' || protocol === 'http:'
}


/** Create a webview */
export function createWebview(profile: Profile, url: string, extensionPath: string, options: WebviewOptions) {
  const { protocol, path } = parseUrl(url)
  const isRemote = isHttpSource(protocol)

  if (isRemote) {
    return remoteHtml(url, profile, options)
  } else {
    // If url is relative, make it asbolute based on the extension path
    const fullPath = isAbsolute(path) ? path : join(extensionPath, path)
    return localHtml(fullPath, profile, options)
  }
}

///////////////
// LOCAL URL //
///////////////
/** Create panel webview based on local HTML source */
function localHtml(url: string, profile: Profile, options: WebviewOptions) {
  const { ext } = parsePath(url)
  const baseUrl = ext === '.html' ? parsePath(url).dir : url

  const panel = window.createWebviewPanel(
    profile.name,
    profile.displayName || profile.name,
    options.column || window.activeTextEditor?.viewColumn || ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [Uri.file(baseUrl)]
    }
  )
  setLocalHtml(panel.webview, baseUrl)

  // Devmode
  if (options.devMode) {
    const index = join(baseUrl, 'index.html')
    watch(index).on('change', _ => setLocalHtml(panel.webview, baseUrl))
  }
  return panel
}

/** Get code from local source */
async function setLocalHtml(webview: Webview, baseUrl: string) {
  const index = `${baseUrl}/index.html`

  // Get all links from "src" & "href"
  const matchLinks = /(href|src)="([^"]*)"/g

  // Vscode requires URI format from the extension root to work
  const toUri = (original: any, prefix: 'href' | 'src', link: string) => {
    // For: <base href="#" /> && remote url : <link href="https://cdn..."/>
    const isRemote = isHttpSource(parseUrl(link).protocol)
    if (link === '#' || isRemote) {
      return original
    }
    // For scripts & links
    const path = join(baseUrl, link)
    const uri = Uri.file(path)
    return `${prefix}="${webview['asWebviewUri'](uri)}"`
  }

  const html = await fs.readFile(index, 'utf-8')
  webview.html = html.replace(matchLinks, toUri)
}




////////////////
// REMOTE URL //
////////////////
/** Create panel webview based on remote HTML source */
function remoteHtml(url: string, profile: Profile, options: WebviewOptions) {
  const { ext } = parsePath(url)
  const baseUrl = ext === '.html' ? parsePath(url).dir : url
  const panel = window.createWebviewPanel(
    profile.name,
    profile.displayName || profile.name,
    options.column || window.activeTextEditor?.viewColumn || ViewColumn.One,
    { enableScripts: true }
  )
  setRemoteHtml(panel.webview, baseUrl)
  return panel
}



/** Fetch remote ressource with http */
function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    get(url, res => {
      let text = ''
      res.on('data', data => text += data)
      res.on('end', _ => resolve(text))
      res.on('error', err => reject(err))
    })
  })
}


/** Get code from remote source */
async function setRemoteHtml(webview: Webview, baseUrl: string) {
  const matchLinks = /(href|src)="([^"]*)"/g
  const index = `${baseUrl}/index.html`


  // Vscode requires URI format from the extension root to work
  const toRemoteUrl = (original: any, prefix: 'href' | 'src', link: string) => {
    // For: <base href="#" /> && remote url : <link href="https://cdn..."/>
    const isRemote = isHttpSource(parseUrl(link).protocol)
    if (link === '#' || isRemote) {
      return original
    }
    // For scripts & links
    const path = join(baseUrl, link)
    return `${prefix}="${path}"`
  }

  const html = await fetch(index)
  webview.html = html.replace(matchLinks, toRemoteUrl)
}
