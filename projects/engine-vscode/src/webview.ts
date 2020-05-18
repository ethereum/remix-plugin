import { PluginConnector, Profile, Message, PluginConnectorOptions, ExternalProfile } from "@remixproject/engine"
import { ExtensionContext, ViewColumn, Webview, WebviewPanel, window, Uri } from 'vscode'
import { join, parse as parsePath } from 'path'
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

  setOptions(options: WebviewOptions) {
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
  return protocol === 'https:' || protocol === 'http:';
}


/** Create a webview */
export function createWebview(profile: Profile, url: string, extensionPath: string, options: WebviewOptions) {
  const { protocol, path } = parseUrl(url)
  const { ext } = parsePath(path)
  const isRemote = isHttpSource(protocol)
  const baseUrl = isRemote
    ? ext === '.html' ? parsePath(url).dir  : url
    : ext === '.html' ? parsePath(path).dir : url

  const panel = window.createWebviewPanel(
    profile.name,
    profile.displayName || profile.name,
    options.column || window.activeTextEditor?.viewColumn || ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: isRemote ? [] : [Uri.file(join(extensionPath, baseUrl))]
    })


  isRemote
    ? setRemoteHtml(panel.webview, baseUrl)
    : setLocalHtml(panel.webview, join(extensionPath, baseUrl))

  // Devmode
  if (options.devMode && !isRemote) {
    const index = join(extensionPath, baseUrl, 'index.html');
    watch(index).on('change', _ => setLocalHtml(panel.webview, join(extensionPath, baseUrl)))
  }

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
  const toRemoteUrl = (_: any, prefix: 'href' | 'src', link: string) => {
    // For: <base href="#" /> && remote url : <link href="https://cdn..."/>
    const isRemote = isHttpSource(parseUrl(link).protocol)
    if (link === '#' || isRemote) {
      return `${prefix}="${link}"`
    }
    // For scripts & links
    const path = join(baseUrl, link)
    return `${prefix}="${path}"`
  }

  const html = await fetch(index)
  webview.html = html.replace(matchLinks, toRemoteUrl)
}


/** Get code from local source */
async function setLocalHtml(webview: Webview, baseUrl: string) {
  const index = `${baseUrl}/index.html`

  // Get all links from "src" & "href"
  const matchLinks = /(href|src)="([^"]*)"/g

  // Vscode requires URI format from the extension root to work
  const toUri = (_: any, prefix: 'href' | 'src', link: string) => {
    // For: <base href="#" /> && remote url : <link href="https://cdn..."/>
    const isRemote = isHttpSource(parseUrl(link).protocol)
    if (link === '#' || isRemote) {
      return `${prefix}="${link}"`
    }
    // For scripts & links
    const path = join(baseUrl, link)
    const uri = Uri.file(path)
    return `${prefix}="${webview['asWebviewUri'](uri)}"`
  }

  const html = await fs.readFile(index, 'utf-8')
  webview.html = html.replace(matchLinks, toUri)
}