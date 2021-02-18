import { Plugin, PluginOptions } from '@remixproject/engine';
import { Profile } from '@remixproject/plugin-utils';
import * as theia from '@theia/plugin';

export const windowProfile: Profile = {
  name: 'window',
  methods: ['prompt', 'select', 'selectFile', 'selectFolder', 'alert', 'error', 'warning'],
}

interface IWindowPlugin {
  /** Display an input window */
  prompt(): PromiseLike<string>
  /** Display a select window */
  select(options: string[]): PromiseLike<string>
  /** Display a select window with local file system: can only select a file */
  selectFile(): PromiseLike<string>
  /** Display a select window with local file system: can only select a folder */
  selectFolder(): PromiseLike<string>
  /** Display a message with actions button. Returned the button clicked if any */
  alert(message: string, actions?: string[]): PromiseLike<string>
  /** Display a warning message with actions button. Returned the button clicked if any */
  warning(message: string, actions?: string[]): PromiseLike<string>
  /** Display an error message with actions button. Returned the button clicked if any */
  error(message: string, actions?: string[]): PromiseLike<string>
}

export class WindowPlugin extends Plugin implements IWindowPlugin {

  constructor(options: PluginOptions = {}) {
    super(windowProfile)
    // Leave 1min to let the user interact with the window
    super.setOptions({ queueTimeout: 60_000, ...options })
  }

  prompt(options?: theia.InputBoxOptions) {
    return theia.window.showInputBox(options)
  }

  select(items: string[], options?: theia.QuickPickOptions) {
    return theia.window.showQuickPick(items, options)
  }

  selectFile() {
    return theia.window.showOpenDialog({ canSelectFiles: true }).then(([file]) => file.fsPath)
  }

  selectFolder() {
    return theia.window.showOpenDialog({ canSelectFolders: true }).then(([folder]) => folder.fsPath)
  }

  alert(message: string, actions: string[] = []) {
    return theia.window.showInformationMessage(message, ...actions)
  }

  error(message: string, actions: string[] = []) {
    return theia.window.showErrorMessage(message, ...actions)
  }

  warning(message: string, actions: string[] = []) {
    return theia.window.showWarningMessage(message, ...actions)
  }

}