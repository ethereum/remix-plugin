# Engine Platform
The engine exposes connector to manage communications with plugins that are not running in the engine main process.

Those connectors depends on the platform on which the engine is operating.

For example an engine running on the web can have connectors with : 
- Iframes
- Webworkers
- ...

On the other hand an engine running in a node environment will have : 
- Child Process
- Worker Threads
- ...

## Create a Connector
A connector is a simple wrapper on both side of a communication for layer, it should implement : 
- `ClientConnector`: Connector used by the plugin (client).
- `PluginConnector`: Connector used by the engine.

> From a user point of view the plugin is the "client" even if it's running in a server.

Let's create a connector for [socket.io](https://socket.io/) where : 
- `ClientConnector`: Plugin code that runs the server.
- `PluginConnector`: Engine recipient that runs in a browser

### ClientConnector
The connector connection on the plugin side implements the `ClientConnector` interface: 

```typescript

```

### 
