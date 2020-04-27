# Engine

The engine manages
- Plugin registration
- Plugin activation
- Plugin communication

## Tutorial

1. [Getting Started](doc/tutorial/1-getting-started.md)
2. [Plugin Communication](doc/tutorial/2-plugin-communication.md)
3. [Host a Plugin with UI](doc/tutorial/3-hosted-plugin.md)
4. [External Plugins](doc/tutorial/4-external-plugins.md)
5. [Plugin Service](doc/tutorial/5-plugin-service.md)

## APIs
- [Engine](doc/api/engine.md)
- [Plugin Manager](doc/api/manager.md)


## Getting started
```
npm install @remixproject/engine
```

The engine works a with two classes : 
- `PluginManager`: manage activation/deactivation
- `Engine`: manage registration & communication 

```typescript
import { PluginManager, Engine, Plugin } from '@remixproject/engine'

const manager = new PluginManager()
const engine = new Engine(manager)
const plugin = new Plugin({ name: 'plugin-name' })

// Wait for the manager to be loaded
await engine.onload()

// Register plugins
engine.register(plugin)

// Activate plugins
manager.activatePlugin('plugin-name')
```

### Registration
The registration make the plugin available for activation in the engine.

To register a plugin you need: 
- `Profile`: The ID card of your plugin.
- `Plugin`: A class that expose the logic of the plugin.

```typescript
const profile = {
  name: 'console',
  methods: ['print']
}

class Console extends Plugin {
  constructor() {
    super(profile)
  }
  print(msg: string) {
    console.log(msg)
  }
}
const consolePlugin = new Console()

// Register plugins
engine.register(consolePlugin)
```

> In the future this part will be manage by a `Marketplace` plugin.

### Activation
The activation pocess is managed by the `PluginManager`.

Actvating a plugin makes it visible by other plugins. Now they can communicate.

```typescript
manager.activatePlugin('console')
```

> The `PluginManager` is a plugin itself.

### Communication
`Plugin` exposes a simple interface to communicate with each others : 

- `call`: Call a method exposed by another plugin (This returns always a Promise).
- `on`: Listen on event emitted by another plugin.
- `emit`: Emit an event broadcasted to all listeners.

This code will call the method `print` from the plugin `console` with the parameter `'My message'`.
```typescript
plugin.call('console', 'print', 'My message')
```

### Full code example
```typescript
import { PluginManager, Engine, Plugin } from '@remixproject/engine'
const profile = {
  name: 'console',
  methods: ['print']
}

class Console extends Plugin {
  constructor() {
    super(profile)
  }
  print(msg: string) {
    console.log(msg)
  }
}

const manager = new PluginManager()
const engine = new Engine(manager)
const emptyPlugin = new Plugin({ name: 'empty' })
const consolePlugin = new Console()

// Wait for the manager to be loaded
await engine.onload()

// Register plugins
engine.register([plugin, consolePlugin])

// Activate plugins
manager.activatePlugin(['empty', 'console'])

// Plugin communication
emptyPlugin.call('console', 'print', 'My message')
```