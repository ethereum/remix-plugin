## Install
```bash
npm install @remixproject/engine
```

## Create the Engine

1. Create the Plugin Manager

The plugin manager can activat/deactivate plugins, and manage permissions between plugins.
```typescript
import { PluginManager } from '@remixproject/engine';

const manager = new PluginManager()
```

2. Create the Engine

The engine manage the communication between plugins. It requires a `PluginManager`.
```typescript
import { PluginManager, Engine } from '@remixproject/engine';

const manager = new PluginManager()
const engine = new Engine(manager)
```

3. Register a plugin

We need to register a plugin before activating it. This is done by the `Engine`.

> ⚠️ **IMPORTANT** You need to wait for the manager to be loaded before registering a plugin.
```typescript
import { PluginManager, Engine, Plugin } from '@remixproject/engine';

const manager = new PluginManager()
const engine = new Engine(manager)
const plugin = new Plugin({ name: 'plugin-name' })

// Wait for the manager to be loaded
await engine.onload()

// Register plugin
engine.register(plugin)
```

4. Activate a plugin

*Once your plugin is registered* you can activate it. This is done by the `PluginManager`
```typescript
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
