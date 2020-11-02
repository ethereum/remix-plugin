
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
// ../../../../../packages/plugin/vscode/src/lib/webview
import { createClient } from '@remixproject/plugin-theia';
import { PluginClient } from '@remixproject/plugin';


export function start(context: theia.PluginContext) {
  const informationMessageTestCommand = {
    id: 'hello-world-example-generated',
    label: "Hello World"
  };
  context.subscriptions.push(theia.commands.registerCommand(informationMessageTestCommand, (...args: any[]) => {
    theia.window.showInformationMessage('Hello World!');
  }));
  const client = createClient()
  client.onload(async () => {
    const data = client.call('filemanager', 'readFile', 'ballot.sol')
  })
}

export function stop() {

}
