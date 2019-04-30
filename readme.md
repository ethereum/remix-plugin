# Remix Plugin

> For the old api, go to [api](./doc/api.md)

ALPHA : This version is still a work in progress and some breaks may be expected (especially names). But the overall stucture should remain unchanged.

## Getting Started

Installation : 
```bash
npm install remix-plugin
```

or with a unpkg : 
```html
<script src="https://unpkg.com/remix-plugin"></script>
```

## Plugin Client
`PluginClient` helps you communicate with the IDE through an Iframe.

To import it you can use ES6 if installed with npm : 
```javascript
import { createIframeClient } from 'remix-plugin'
const client = createIframeClient()

// Or with a global variable if you used unpkg : 

const { createIframeClient } = remixPlugin
const client = createIframeClient()
```

---
## DevMode
Plugins communicate with the IDE through the `postMessage` API. It means that `PluginClient` needs to know the origin of your IDE.

If you're developping a plugin with your IDE running on `localhost` you'll need to specify the port on which your IDE runs : 
```typescript
const devMode = { port: 8000 }
const client = createIframeClient([], { devMode })
```

---

### Loaded
`PluginClient` listen on a first handshake from the IDE before beeing able to communicate back. For that you need to wait for the Promise / callback `onload` to be called.

```javascript
client.onload(() => /* Do something */)
client.onload().then(_ => /* Do Something now */)
await client.onload()
```

### Listen
To listen to an event you need to provide the name of the plugin your listening on, and the name of the event : 
```javascript
client.listen(/* pluginName */, /* eventName */, ...arguments)
```

For exemple if you want to listen to Solidity compilation : 
```javascript
client.listen('solidity', 'compilationFinished', (target, source, version, data) => {
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

Let's say your plugin build a deploy a Readme for your contract on IPFS : 
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

|API            |Name                                         |Permission |Description |
|---------------|-------------|-------------------------------|-------------
|File System    |[fileManager](./doc/plugins/file-system.md)  |✅         |Manages the File System
|Compiler       |[solidity](./doc/plugins/solidity.md)        |✅         |The solidity Compiler
|Editor         |[editor](./doc/plugins/editor.md)            |           |Enables highlighting in the code Editor
|Network        |[network](./doc/plugins/network.md)          |           |Defines the network (mainnet, ropsten, ...) and provider (web3, vm, injected) used
|Udapp          |[udapp](./doc/plugins/udapp.md)              |           |Transaction listener

> This API is a Work In Progress and will be extended in the future.


## Theme
Remix is using [Bootstrap](https://getbootstrap.com/). For better User Experience it's **highly recommanded** to use the same theme as Remix in your plugin. For that you _just_ have to use standard bootstrap classes.

Remix will automatically create a `<link/>` tag in the header of your plugin with the current theme used. And it'll update the link each time the user change the theme.

If you really want to use your own theme, you can use the `customTheme` flag in the option : 
```typescript
const client = createIframeClient([customApis], { customTheme: true })
```

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
  key: string  // Name of the icon from font-awesome 5 or a number to display (still as a string)
  type: 'success' | 'info' | 'warning' | 'danger'  // Bootstrap css variable to use
  title?: string  // Describe the status on mouseover
}
```

You can also change the status of your own plugin by emitting the same event : 
```typescript
client.emit('statusChanged', { key: 'check', type: 'success', title: 'Documentation ready !' })
```
> The IDE can use this status to display a notification to the user.