import { ExtensionContext, workspace } from 'vscode';
import { WindowPlugin } from '@remixproject/engine-vscode';
import { Engine, PluginManager } from '@remixproject/engine';

// On activation
export async function activate(context: ExtensionContext) {
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {
    const root = folder.uri.fsPath;
    const manager = new PluginManager();
    const engine = new Engine();
    const window = new WindowPlugin();
    engine.register([manager, window]);
  }
}
