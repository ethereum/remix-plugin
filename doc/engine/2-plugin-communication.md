## Plugins Communication

Each plugin can call methods exposed by other plugin. Let's see how to expose a method from one plugin and call it from another.

1. Create Plugin that exposes a method
You can extends the `Plugin` class to create your own plugin. The list of exposed methods are defined in the field `methods` of the profile: 
```typescript
class FirstPlugin extends Plugin {
  constructor() {
    // Expose method "getVersion" to other plugins
    super({ name: 'first', methods: ['getVersion']})
  }
  // Implementation of the exposed method
  getVersion() {
    return 0
  }
}
```

2. Create a Plugin that calls the `getVersion`
The `Plugin` class provides a `call` method to make a request to other plugin's methods

> The `call` method is available only when the plugin is activated by the plugin manager

```typescript
class SecondPlugin extends Plugin {
  constructor() {
    super({ name: 'second' })
  }

  getFirstPluginVersion(): Promise<number> {
    // Call the methode "getVersion" of plugin "first"
    return this.call('first', 'getVersion')
  }
}
```

3. Register & activate plugins
`Engine` & `PluginManager` can register & activate a list of plugins at once.
```typescript
const manager = new PluginManager()
const engine = new Engine(manager)
const first = new FirstPlugin()
const second = new SecondPlugin()

// ⚠️ Don't forget to wait for the manager to be loaded
await engine.onload()

// Register both plugins 
engine.register([first, second])

// Activate both plugins
await manager.activatePlugin(['first', 'second'])

// Call method "getVersion" of first plugin from second plugin 
const firstVersion = await second.getFirstPluginVersion()
```

## Full Example

```typescript
class FirstPlugin extends Plugin {
  constructor() {
    // Expose method "getVersion" to other plugins
    super({ name: 'first', methods: ['getVersion']})
  }
  // Implementation of the exposed method
  getVersion() {
    return 0
  }
}

class SecondPlugin extends Plugin {
  constructor() {
    super({ name: 'second' })
  }

  getFirstPluginVersion(): Promise<number> {
    // Call the methode "getVersion" of plugin "first"
    return this.call('first', 'getVersion')
  }
}


const manager = new PluginManager()
const engine = new Engine(manager)
const first = new FirstPlugin()
const second = new SecondPlugin()

// wait for the manager to be loaded
await engine.onload()

// Register both plugins 
engine.register([first, second])

// Activate both plugins
await manager.activatePlugin(['first', 'second'])

// Call method "getVersion" of first plugin from second plugin 
const firstVersion = await second.getFirstPluginVersion()
```

🧪 [Tested code available here](../../examples/engine/tests/2-plugin-communication.ts)