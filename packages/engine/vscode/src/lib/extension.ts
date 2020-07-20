// Check here : https://code.visualstudio.com/api/references/vscode-api#extensions
import { ClientConnector } from "@remixproject/plugin"
import { PluginConnector } from "@remixproject/engine"
import { extensions, Extension } from 'vscode'
import { Profile, Message } from '../../utils'

class ExtensionConnector implements ClientConnector {
  onMessage(message: Partial<Message>) {
    throw new Error('not implemented')
  }
}

export class ExtensionPlugin extends PluginConnector {
  private extension: Extension<ExtensionConnector>
  private connector: ExtensionConnector

  constructor(profile: Profile) {
    super(profile)
  }

  protected send(message: Partial<Message>): void {
    if (this.extension) {
      this.connector.onMessage(message)
    }
  }

  protected async connect(url: string): Promise<void> {
    try {
      this.extension = extensions.getExtension(url)
      this.connector = await this.extension.activate()
    } catch (err) {
      throw new Error(`ExtensionPlugin "${this.profile.name}" could not connect to the engine.`)
    }
  }

  protected disconnect(): void {
    if (this.extension) {}
  }
}
