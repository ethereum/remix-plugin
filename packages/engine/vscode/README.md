# Engine vscode
The vscode engine provide a list of connector & plugin to build an plugin engine inside vscode.
```
npm install @remixproject/engine-vscode
```

## webview
The webview connector open a webview in the worspace and connect to it. The plugin must use `@remixproject/plugin-vscode` to be able to establish connection.

```typescript
export async function activate(context: ExtensionContext) {

  const myPlugin = new WebviewPlugin({
    name: 'my-plugin',
    url: 'https://my-plugin-path.com',
    methods: ['getData']
  }, { context }) // We need to pass the context as scond parameter

  engine.register(myPlugin);
  // This will create the webview and inject the code inside
  await manager.activatePlugin('my-plugin');
  const data = manager.call('my-plugin', 'getData');

}
```

> The url can also be local. In this case you must provide an absolute path.

