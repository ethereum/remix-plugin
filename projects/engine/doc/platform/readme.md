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
export interface ClientConnector {
  /** Send a message to the engine */
  send(message: Partial<Message>): void
  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void): void
}
```

```typescript
class SocketIOConnector implements ClientConnector {

  constructor(private socket) {}
  send(message: Partial<Message>) {
    this.socket.emit('message', message)
  }
  on(cb: (message: Partial<Message>) => void)) {
    this.socket.on('message', (msg) => cb(message))
  }
}
```

### PluginConnector
The `PluginConnector` is an abstract class to be extended: 

```typescript
class SocketIOPlugin extends PluginConnector {
  private readonly listener = ['message', (msg: Message) => this.getMessage(msg)] as const
  socket: SocketIOClient

  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  protected connect(url: string): void {
    this.socket = io(this.profile.url)
    this.socket.on('connect', () => {
      this.socket.on('message', (msg: Message) => this.getMessage(msg))
    })
  }

  protected disconnect(): void {
    this.socket.close()
  }

  protected send(message: Partial<Message>): void {
    if (!this.process?.connected) {
      throw new Error(`Child process from plugin "${this.name}" is not yet connected`)
    }
    this.socket.send(message)
  }

}
```

Let's take a look : 
- `connect` will be called when the plugin is activated.
- `disconnect` will be called when the plugin is deactivated.
- `send` will be callde when another plugin when to call the plugin's methods (on the server).
- `getMessage` should be called whenever a message arrives.