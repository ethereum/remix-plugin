# Engine vscode
The **vscode engine** provides a list of connectors & plugins for a **plugin engine** that is built inside vscode.
```
npm install @remixproject/engine-vscode
```

## Setup
You can use the remixproject engine to create a plugin system on top of a vscode extension.
For that you need to create an engine and start registering your plugins.

> checkout [@remixproject/engine documentation](../core/README.md) for more details.

```typescript
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
  })
}
```

## Build-in plugins
`@remixproject/engine-vscode` comes with build-in plugins for `vscode`.

### webview
The webview plugin opens a webview in the workspace and connects to it.
The plugin must use [`@remixproject/plugin-webview`](../../plugin/webview/README.md) to be able to establish connection.

```typescript
import { WebviewPlugin } from '@remixproject/engine-vscode'
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
    const webview = new WebviewPlugin({
      name: 'webview-plugin',
      url: 'https://my-plugin-path.com',
      methods: ['getData']
    }, { context }) // We need to pass the context as scond parameter

    engine.register(webview);
    // This will create the webview and inject the code inside
    await manager.activatePlugin('webview-plugin');
    const data = manager.call('webview-plugin', 'getData');
  })
}
```

The url can be : 
- remote
- absolute
- relative to the **extension file** (option.relativeTo === 'extension')
- relative to the **open workspace** (option.relativeTo === 'workspace')

> The url can also be local. In this case you must provide an **absolute path**.

#### Options
- `context`: The context of the vscode extension.
- `column`: The `ViewColumn` in which run the webview.
- `relativeTo`: If url is relative, is it relative to 'workspace' or 'extension' (default to 'extension')

### terminal
The terminal plugin gives access to the current terminal in vscode.

```typescript
import { TerminalPlugin } from '@remixproject/engine-vscode'
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
    const terminal = new TerminalPlugin()

    engine.register(terminal);
    await manager.activatePlugin('terminal');
    // Execute "npm run build" in the terminal
    manager.call('terminal', 'exec', 'npm run build');
  })
}
```


### Window
Provides access to the native window of vscode.

```typescript
import { WindowPlugin } from '@remixproject/engine-vscode'
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
    const window = new WindowPlugin()

    engine.register(window);
    await manager.activatePlugin('window');
    // Open a prompt to the user
    const fortyTwo = await manager.call('window', 'prompt', 'What is The Answer to the Ultimate Question of Life, the Universe, and Everything');
  })
}
```

### File Manager
Provides access to the file system through vscode api.
```typescript
import { FileManagerPlugin } from '@remixproject/engine-vscode'
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
    const fs = new FileManagerPlugin()

    engine.register(fs);
    await manager.activatePlugin('filemanager');
    // Open a file into vscode
    // If path is relative it will look at the root of the open folder in vscode
    await manager.call('filemanager', 'open', 'package.json');
  })
}
```

### Theme
Remix's standard theme wrapper for vscode.
Use this plugin to take advantage of the Remix's standard themes for your plugins.
Otherwise, consider using [vscode's color api](https://code.visualstudio.com/api/references/theme-color) directly in your webview.
```typescript
import { ThemePlugin } from '@remixproject/engine-vscode'
import { Engine, Manager } from '@remixproject/engine';

export async function activate(context: ExtensionContext) {
  const manager = new Manager();
  const engine = new Engine(manager);
  engine.onload(() => {
    // register your plugins here
    const theme = new ThemePlugin()
    engine.register(fs);
    await manager.activatePlugin('theme');
    // Now your webview can listen on themeChanged event from the theme plugin
  })
}
```