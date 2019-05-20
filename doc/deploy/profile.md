# Profile

The profile is the _ID card_ of your plugin. It tells the IDE :

- The events your plugin listen on.
- The events your plugin emits.
- The methods your plugin exposes.

## Example

Here are some profile examples :

Ethdoc profile :
```json
{
  "name": "ethdoc",
  "displayName": "Ethereum Documentation",
  "description": "Create the documentation markdown file of a contract.",
  "events": ["newDoc"],
  "methods": ["getdoc"],
  "notifications": {
    "solidity": ["compilationFinished"]
  },
  "url": "http://localhost:8000",
  "icon": "link-to-icon-image",
  "location": "sidePanel"
}
```

Vyper compiler profile
```json
{
  "name": "vyper",
  "displayName": "Vyper",
  "description": "Compile vyper contracts",
  "events": ["compilationFinished"],
  "methods": [],
  "notifications": {
    "fileManager": ["currentFileChanged"]
  },
  "url": "https://remix-vyper-plugin.surge.sh",
  "kind": "compile",
  "icon": "data:image/svg+xml;base64,...BASE64-ICON-IMAGE...",
  "location": "sidePanel"
}
```

----

## Keys

Let's go through each key :

### name

The name of the plugin. It has to be **camelCase**.

### displayName

The name displayed in the IDE (in the pluginManager tab for Remix IDE for example).

### description

A short description of what does the plugin. It should be displayed by the IDE.

### events

The list of events the plugin emits. Vyper compiler plugin, for example, emit a `compilationFinished` event when compilation succeed.

### methods

The list of methods exposed by the plugin. Any plugin can get the current documentation file from the Ethdoc plugin with the `getDoc` method for example.

### notifications

A map of event to listen to. This tells the IDE to create add an event listener for your plugin on those events. For example, Ethdoc is listening on `compilationFinished` event from the `solidity` plugin.

By default only `themeChanged` from the `theme` plugin is registered. You need to specify all other events you want to listen to. **Please double check**.

### url

This is the url where your plugin is hosted (Swarm, IPFS, CDN, ...).

### kind

Only apply if your plugin is one of these : 
- compiler
- file system
- editor
- network
- udapp

Then it needs to match the interface.

### icon

Either a link or a Base64 version of the icon of the plugin.

### location

Where the plugin lives. For now it's either : 
- `sidePanel` : Aside of the editor.
- `mainPanel` : The main view, where the editor is.
- `none` : The plugin is not displayed. For language services plugins for example.