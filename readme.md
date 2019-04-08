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

## Remix Extension
`RemixExtension` helps you communicate with the IDE.

To import it you can use ES6 if installed with npm : 
```javascript
import { RemixExtension } from 'remix-plugin'
const extension = new RemixExtension()

// Or with a global variable if you used unpkg : 

const { RemixExtension } = remixPlugin
const extension = new RemixExtension()
```

---
## DevMode
Plugins communicate with the IDE through the `postMessage` API. It means that `RemixExtension` needs to know the origin of your IDE.

If you're developping a plugin with your IDE running on `localhost` you'll need to specify the port on which your IDE runs : 
```typescript
extension.setDevMode(8000) 
// or
extension.setDevMode()  // default is port 8080
```

---

### Loaded
`RemixExtension` listen on a first handshake from the IDE before beeing able to communicate back. For that you need to wait for the Promise `loaded` to be called.

```javascript
extension.loaded().then(_ => /* Do Something now */)

// Or with the `async` / `await` syntax

await extension.loaded()
// Do Something now
```

### Listen
To listen to an event you need to provide the name of the plugin your listening on, and the name of the event : 
```javascript
extension.listen(/* pluginName */, /* eventName */, ...arguments)
```

For exemple if you want to listen to Solidity compilation : 
```javascript
extension.listen('solidity', 'compilationFinished', (target, source, version, data) => {
    /* Do Something on Compilation */
  }
)
```

> See all available event [below](#api).

### Call 
You can call some methods exposed by the IDE with with the method `call`. You need to provide the name of the plugin, the name of the method, and the arguments of the methods : 
```javascript
await extension.call(/* pluginName */, /* methodName */, ...arguments)
```
> Note: `call` is alway Promise

For example if you want to upsert the current file : 
```typescript
async function upsertCurrentFile(content: string) {
  const path = await extension.call('fileManager', 'getCurrentFile')
  await extension.call('fileManager', 'setFile', path, content)
}
```

> Note: Be sure that your plugin is loaded before making any call.

### Emit
Your plugin can emit events that other plugins can listen on.
```javascript
extension.emit(/* eventName */, ...arguments)
```

Let's say your plugin build a deploy a Readme for your contract on IPFS : 
```javascript
async function deployReadme(content) {
  const [ result ] = await ipfs.files.add(content);
  extension.emit('readmeDeployed', result.hash)
}
```

> Note: Be sure that your plugin is loaded before making any call.

<div align="center">
<img src="./doc/imgs/remix-extension.png" width="300">
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
This API is a Work In Progress and will be extended in the future.

### Permission
Some of the APIs have to be used with caution. So they might ask the permission of the user.

|API            |name         |Permission |
|---------------|-------------|-----------|
|File System    |fileManager  |✅
|Compiler       |solidity     |✅
|Editor         |editor       |
|Network        |network      |
|Udapp          |udapp        |


## File System

Name: `fileManager`

Remix uses a folder based 

|Type     |Name               |
|---------|-------------------|
|_event_  |currentFileChanged |
|_method_ |getFilesFromPath   |
|_method_ |getCurrentFile     |
|_method_ |getFile            |
|_method_ |setFile            |

```typescript
extension.listen('fileManager', 'currentFileChanged', (fileName: string) => {
  // Do something
})

const filesTree = await extension.call('fileManager', 'getFilesFromPath', 'browser')
const content = await extension.call('fileManager', 'getFile', 'browser/ballot.sol')
const content = await extension.call('fileManager', 'getFile', 'browser/ballot.sol')
await extension.call('fileManager', 'setFile', 'browser/ballot.sol', '/** File Content */')
```

## Editor

Name: `editor`

Use the editor to highlight a piece of code. Remix uses Ace editor by default.

|Type     |Name                 |
|---------|---------------------|
|_method_ |highlight            |
|_method_ |discardHighlight     |

```typescript
// Hightlight a piece of code with color "#e6e6e6"
await extension.call('editor', 'highlight', {
  start: { line: 1, column: 1 },
  end: { line: 1, column: 42 }
}, 'browser/ballot.sol', '#e6e6e6')
// Remove the highlight of this plugin
await extension.call('editor', 'discardHighlight')
```

## Compiler

Name: `solidity`

Remix exposes the `solidity` compiler.
> The `vyper` compiler is exposed by an external plugin.

|Type     |Name                 |
|---------|---------------------|
|_event_  |compilationFinished  |
|_method_ |getCompilationResult |

```typescript
// Event : compilationFinished
extension.listen('solidity', 'compilationFinished', 
  (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
  // Do something
})

// Method : getCompilationResult
const result = await extension.call('solidity', 'getCompilationResult')
```

## Network

Name: `network`

With Remix IDE you can listen on default network (`mainnet`, `ropsten`, `rinkeby`, `kovan`), or custom one (`ganache`, Etherum Sidechain).

|Type     |Name               |
|---------|-------------------|
|_event_  |providerChanged    |
|_method_ |getNetworkProvider |
|_method_ |getEndpoint        |
|_method_ |detectNetwork      |
|_method_ |addNetwork         |
|_method_ |removeNetwork      |

```typescript
// Event : providerChanged
extension.listen('network', 'providerChanged', (provider: networkProvider) => {
  // Do something
})

// getNetworkProvider: "vm", "web3" or "injected"
const provider = await extension.call('network', 'getNetworkProvider')
// getEndpoint: Return the url of the current network if provider is web3
const endpoint = await extension.call('network', 'getEndpoint')
// detectNetwork: Return the current network (mainnet, ropsten, ... or Custom)
const network = await extension.call('network', 'detectNetwork')
// addNetwork: Add a custom network
await extension.call('network', 'addNetwork', { name: 'ganache', url: 'http://localhost:8586'})
// removeNetwork: Remove a custom network
await extension.call('network', 'removeNetwork', 'ganache')
```

## Udapp

Name: `udapp`

The Universal Dapp is an abstraction on top of the Virtual Machine.

|Type     |Name                 |
|---------|---------------------|
|_event_  |newTransaction       |
|_method_ |createVMAccount      |
|_method_ |getAccounts          |
|_method_ |sendTransaction      |


```typescript
extension.listen('udapp', 'newTransaction', (tx: TxRemix) => {
  // Do Something
})

// createVMAccount: Create an account if the provider is "vm"
const account = await extension.call('udapp', 'createVMAccount')
// getAccounts: The list of current accounts
const accounts = await extension.call('udapp', 'getAccounts')
// sendTransaction: Send a transaction or make a call to the network
extension.call('udapp', 'sendTransaction', {
  gasLimit: '0x2710',
  from: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  to: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c'
  data: '0x...',
  value: '0x00',
  useCall: false
})
```

# Status
Every plugin has a status object that can display notifications on the IDE. You can listen on a change of status from any plugin using `statusChanged` event : 

```typescript
extension.listen('fileManager', 'statusChanged', (status: Status) => {
  // Do Something 
})
```

The status object is used for displaying a notification. It looks like that : 
```typescript
interface Status {
  iconName: string  // Name of the icon from font-awesome
  type: 'success' | 'info' | 'warning' | 'danger'  // Bootstrap css variable to use
  title?: string  // Describe the status on mouseover
}
```

You can also change the status of your own plugin by emitting the same event : 
```typescript
extension.emit('statusChanged', { iconName: 'check', type: 'success', title: 'Documentation ready !' })
```
> The IDE can use this status to display a notification to the user.