# Remix Plugin

The repository host the code required for remix-plugin. It's divided into two type of projects: 
- Engine: The code needed to host remix plugins in your project (used in remix-ide).
- Plugin: The code that runs in a plugin.


## Engine

Currently the engine can only run inside the web. A node version is coming for v0.3.0

If you want to implement the remix engine in your project checkout [full documentation here](./doc/engine)

## Plugin

Currently there are 3 types of plugin communication supported : 
- iframe (web)
- websocket (web)
- child_process (node)

If you want to create a plugin for remix-ide, checkout the documentation below.

## Getting Started

> This getting started is for building iframe based plugin (only supported by remix-ide for now).

Installation :
```bash
npm install @remixproject/plugin-iframe
```

or with a unpkg :
```html
<script src="https://unpkg.com/@remixproject/plugin"></script>
```

### Plugin Client
The plugin client is how you connect your plugin to remix.

To import ( the ES6 way) with NPM use:
```javascript
import { createIframeClient } from '@remixproject/plugin'
const client = createIframeClient()
```
Or if you are using unpkg use:
```javascript
const { createIframeClient } = remixPlugin
const client = createIframeClient()
```


### Examples
You can find examples of plugins here :
- [Hello World](./examples/plugins/hello-world)
- [Lit Element](./examples/plugins/ethdoc)
- [Etherscan Verification](./examples/plugins/etherscan)
- [3box storage](https://github.com/pldespaigne/remix-3box-plugin)

---
## Test inside Remix IDE
To test your plugin with remix:
1. Go to http://remix-alpha.ethereum.org. (if your localhost is over HTTP, you need to use http for Remix IDE).
2. Click on the plugin manager (Plug icon on the left).
3. Click on "Connect to a Local Plugin".
4. Fill the profile info of you plugin ().
5. Click on "ok".
6. A new icon should appear on the left, this is where you can find you plugin.


<div align="center">
  <img src="./doc/videos/remix_local_plugin.gif" width="600">
</div>

---
## Client API

### Loaded
`PluginClient` listen on a first handshake from the IDE before beeing able to communicate back. For that you need to wait for the Promise / callback `onload` to be called.

```javascript
client.onload(() => /* Do something */)
client.onload().then(_ => /* Do Something now */)
await client.onload()
```

### Events
To listen to an event you need to provide the name of the plugin you're listening on, and the name of the event :
```javascript
client.on(/* pluginName */, /* eventName */, ...arguments)
```

For exemple if you want to listen to Solidity compilation :
```javascript
client.on('solidity', 'compilationFinished', (target, source, version, data) => {
    /* Do Something on Compilation */
  }
)
```

⚠️ Be sure that your plugin is loaded before listening on an event.

> See all available event [below](#api).

### Call
You can call some methods exposed by the IDE with with the method `call`. You need to provide the name of the plugin, the name of the method, and the arguments of the methods :
```javascript
await client.call(/* pluginName */, /* methodName */, ...arguments)
```
> Note: `call` is alway Promise

For example if you want to upsert the current file :
```typescript
async function upsertCurrentFile(content: string) {
  const path = await client.call('fileManager', 'getCurrentFile')
  await client.call('fileManager', 'setFile', path, content)
}
```

⚠️ Be sure that your plugin is loaded before making any call.

### Emit
Your plugin can emit events that other plugins can listen on.
```javascript
client.emit(/* eventName */, ...arguments)
```

Let's say your plugin build deploys a Readme for your contract on IPFS :
```javascript
async function deployReadme(content) {
  const [ result ] = await ipfs.files.add(content);
  client.emit('readmeDeployed', result.hash)
}
```

> Note: Be sure that your plugin is loaded before making any call.

### Expose methods
Your plugin can also exposed methods to other plugins. For that you need to extends the `PluginClient` class, and override the `methods` property : 
```typescript
class MyPlugin extends PluginClient {
  methods: ['sayHello'];

  sayHello(name: string) {
    return `Hello ${name} !`;
  }
}
const client = buildIframeClient(new MyPlugin())
```
> When extending the `PluginClient` you need to connect your client to the iframe with `buildIframeClient`.

You can find an exemple [here](https://github.com/pldespaigne/remix-3box-plugin).

### Testing your plugin
You can test your plugin direcly on the [alpha version of Remix-IDE](https://remix-alpha.ethereum.org). Go to the `pluginManager` (plug icon in the sidebar), and click "Connect to a Local Plugin".

Here you can add :
- A name : this is the name used by other plugin to listen to your events.
- A displayName : Used by the IDE.
- The url : May be a localhost for testing.

> Note: No need to do anything if you localhost auto-reload, a new `handshake` will be send by the IDE.

### Publish your plugin on Remix IDE
To publish on Remix IDE, uou need to create a `Profile` for you plugin with the following field : 
```typescript
interface Profile {
  name: string, // The name of your plugin in camelCase (used inside client.call(name, method, payload)).
  displayName: string, // The name displayed by the IDE
  description: string, // A description to display in the IDE
  events: [], // Name of the events
  methods: ['sayHello'], // Name of the methods exposed by the plugin
  url: string, // URL where your plugin is hosted
  icon: string, // Url of the icon to display on tab
  location: 'mainPanel' | 'sidePanel' | 'none' // Where your plugin should be displayed in the IDE
}
```

# API
Your plugin can interact with other plugins through the API. `@remixproject/plugin` provide a set of default plugins integrated inside the Remix IDE. Some of the APIs have to be used with caution. So they might ask the permission of the user.


## Remix IDE API
List of native plugins exposed by Remix IDE

_Click on the name of the api to get the full documentation._

|API            |Name                                         |Permission |Description |
|---------------|---------------------------------------------|-----------|-------------
|File System    |[fileManager](./doc/plugins/file-system.md)  |✅         |Manages the File System
|Compiler       |[solidity](./doc/plugins/solidity.md)        |✅         |The solidity Compiler
|Editor         |[editor](./doc/plugins/editor.md)            |           |Enables highlighting in the code Editor
|Network        |[network](./doc/plugins/network.md)          |           |Defines the network (mainnet, ropsten, ...) and provider (web3, vm, injected) used
|Udapp          |[udapp](./doc/plugins/udapp.md)              |✅         |Transaction listener
|Unit Testing   |[solidityUnitTesting](./doc/plugins/unit-testing.md) |    |Unit testing library in solidity
|Settings       |[settings](./doc/plugins/settings.md)        |✅         |Global settings of the IDE
|Content Import |[contentImport](./doc/plugins/content-import.md) |        |Import files from  github, swarm, ipfs, http or https.

> This API is a Work In Progress and will be extended in the future.

## External API
List of plugins developed by the community.

|API            |Name                                         |Permission |Description |
|---------------|---------------------------------------------|-----------|-------------
|3Box           |[box](./doc/external-api/3box.md)          |           |Decentralized storage.


## Status
Every plugin has a status object that can display notifications on the IDE. You can listen on a change of status from any plugin using `statusChanged` event :

```typescript
client.on('fileManager', 'statusChanged', (status: Status) => {
  // Do Something 
})
```

The status object is used for displaying a notification. It looks like that :
```typescript
interface Status {
  key: number | 'edited' | 'succeed' | 'loading' | 'failed' | 'none'  // Display an icon or number
  type?: 'success' | 'info' | 'warning' | 'error'  // Bootstrap css color
  title?: string  // Describe the status on mouseover
}
```
- If you want to remove a status use the `'none'` value for `key`.
- If you don't define type, it would be the default value ('info' for Remix IDE).

You can also change the status of your own plugin by emitting the same event :
```typescript
client.emit('statusChanged', { key: 'succeed', type: 'success', title: 'Documentation ready !' })
```
> The IDE can use this status to display a notification to the user.


### Client Options

#### CSS Theme
Remix is using [Bootstrap](https://getbootstrap.com/). For better User Experience it's **highly recommanded** to use the same theme as Remix in your plugin. For that you _just_ have to use standard bootstrap classes.

Remix will automatically create a `<link/>` tag in the header of your plugin with the current theme used. And it'll update the link each time the user change the theme.

If you really want to use your own theme, you can use the `customTheme` flag in the option :
```typescript
const client = createIframeClient({ customTheme: true })
```

#### Custom Api
By default `@remixproject/plugin` will use remix IDE api.
If you want to extends the API you can specify it in the `customApi` option.

A good use case is when you want to use an external plugin not maintained by Remix team (3box plugin for example): 

```typescript
import { remixProfiles, IRemixApi } from '@remixproject/plugin'
interface ICustomApi extends IRemixApi {
  box: IBox;
}

export type CustomApi = Readonly<ICustomApi>;

export type RemixClient = PluginClient<any, CustomApi> & PluginApi<CustomApi>;

const customApi: ProfileMap<RemixIDE> = Object.freeze({
  ...remixProfiles,
  box: boxProfile
});
const client = createIframeClient({ customApi })
```

> You'll need Typescript > 3.4 to leverage the types.

#### DevMode
Plugins communicate with the IDE through the `postMessage` API. It means that `PluginClient` needs to know the origin of your IDE.

If you're developing a plugin with your IDE running on `localhost` you'll need to specify the port on which your IDE runs. By default the port used is *8080*. To change it you can do:
```typescript
const devMode = { port: 3000 }
const client = createIframeClient({ devMode })
```