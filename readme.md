# Remix Plugin

Remix plugin helps you extends the Remix IDE. The goal is to give access of all the features inside Remix and make them available for Ethereum Developers.

Remix Plugin can be use (but not only) for :
- Educational Purpose.
- Smart-Contract library managment.
- Language Service.
- Smart-Contract language compiler.
- Static Analysis.
- Other services...

**ALPHA**

Use Remix alpha version to test your plugin : http://remix-alpha.ethereum.org/

This version is still a work in progress and some breaks may be expected (especially names). But the overall stucture should remain unchanged.

## Getting Started

Installation :
```bash
npm install remix-plugin
```

or with a unpkg :
```html
<script src="https://unpkg.com/remix-plugin"></script>
```

### Plugin Client
The plugin client is how you connect your plugin to remix.

To import ( the ES6 way) with NPM use:
```javascript
import { createIframeClient } from 'remix-plugin'
const client = createIframeClient()
```
Or if you are using unpkg use:
```javascript
const { createIframeClient } = remixPlugin
const client = createIframeClient()
```

### Client Options

#### Custom Api
To leverage Typescript types, you can define some custom apis.
```typescript
import { remixApi } from 'remix-plugin'
const client = createIframeClient({ customApi: remixApi })
```
This will provide you all the types of the plugin exposed by the Remix IDE.
For example :
```typescript
client.fileManager.setFile(path, content)              // With customApi
client.call('fileManager', 'setFile', path, content)   // Without customApi
```
> You'll need Typescript > 3.4 to leverage those types.

#### DevMode
Plugins communicate with the IDE through the `postMessage` API. It means that `PluginClient` needs to know the origin of your IDE.

If you're developing a plugin with your IDE running on `localhost` you'll need to specify the port on which your IDE runs :
```typescript
const devMode = { port: 8080 } // By default Remix IDE runs on port 8080
const client = createIframeClient({ devMode })
```

### Examples
You can find examples of plugins here :
- [Hello World](./examples/plugins/hello-world)
- [Lit Element](./examples/plugins/ethdoc)
- [Etherscan Verification](./examples/plugins/etherscan)

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

<div align="center">
<img src="./doc/imgs/remix-client.png" width="300">
</div>

### Testing your plugin
You can test your plugin direcly on the [alpha version of Remix-IDE](https://remix-alpha.ethereum.org). Go to the `pluginManager` (plug icon in the sidebar), and click "Connect to a Local Plugin".

Here you can add :
- A name : this is the name used by other plugin to listen to your events.
- A displayName : Used by the IDE.
- The url : May be a localhost for testing.

> Note: No need to do anything if you localhost auto-reload, a new `handshake` will be send by the IDE.

### Publish your plugin
This is not available now.

# API
Your plugin can interact with other plugins through the API. `remix-plugin` provide a set of default plugins integrated inside the Remix IDE. Some of the APIs have to be used with caution. So they might ask the permission of the user.


## Remix Api
Click on the name of the api to get the full documentation.

|API            |Name                                         |Permission |Description |
|---------------|-------------|-------------------------------|-------------
|File System    |[fileManager](./doc/plugins/file-system.md)  |✅         |Manages the File System
|Compiler       |[solidity](./doc/plugins/solidity.md)        |✅         |The solidity Compiler
|Editor         |[editor](./doc/plugins/editor.md)            |           |Enables highlighting in the code Editor
|Network        |[network](./doc/plugins/network.md)          |           |Defines the network (mainnet, ropsten, ...) and provider (web3, vm, injected) used
|Udapp          |[udapp](./doc/plugins/udapp.md)              |✅         |Transaction listener

> This API is a Work In Progress and will be extended in the future.

## Status
Every plugin has a status object that can display notifications on the IDE. You can listen on a change of status from any plugin using `statusChanged` event :

```typescript
client.listen('fileManager', 'statusChanged', (status: Status) => {
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

## CSS Theme
Remix is using [Bootstrap](https://getbootstrap.com/). For better User Experience it's **highly recommanded** to use the same theme as Remix in your plugin. For that you _just_ have to use standard bootstrap classes.

Remix will automatically create a `<link/>` tag in the header of your plugin with the current theme used. And it'll update the link each time the user change the theme.

If you really want to use your own theme, you can use the `customTheme` flag in the option :
```typescript
const client = createIframeClient({ customTheme: true })
```

