## Plugin electon

How to use the plugin:

In electron you 
1. add the base plugin to a basic engine in electron: ElectronBasePlugin
2. define the clients: ElectronBasePluginClient

3. In Remix you add a simple plugin: ElectronPlugin
4. You configer the preload script array to hold your plugin, see example below. If you don't do that you won't be able to call the plugin.

The base plugin holds the clients, and each client holds a reference to the window it instantiated from.
More below about the engine.
The base plugin is called by the engine in Electron, you're not calling it from Remix. Only the ElectronBasePluginClient linked to a specific window is the one you are calling from Remix. So internal methods of the base plugin are used for example by the menu or you can call when something happens in electron, ie before the app is closed. 

```
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import { Profile } from "@remixproject/plugin-utils";

const profile: Profile = {
    displayName: 'exampleplugin',
    name: 'exampleplugin',
    description: 'Electron example plugin'
}

export class ExamplePlugin extends ElectronBasePlugin {
    clients: ExamplePluginClient[] = []
    constructor() {
        super(profile, clientProfile, ExamplePluginClient)
        this.methods = [...super.methods, 'internalMethod', 'doOnAllClients']
    }

    async internalMethod(data: any): Promise<void> {
        // do something
    }

    // execute on all clients
    async doOnAllClients(): Promise<void> {
        for (const client of this.clients) {
            await client.doSomething()
        }
    }

}

const clientProfile: Profile = {
    name: 'exampleplugin',
    displayName: 'exampleplugin',
    description: 'Electron example plugin',
    methods: ['remixMethod']
}

class ExamplePluginClient extends ElectronBasePluginClient {

    constructor(webContentsId: number, profile: Profile) {
        super(webContentsId, profile)
        
        this.window.on('close', async () => {
            // do something on window close
        })
    }

    async remixMethod(data: any): Promise<void> {
        // do something
    }

    async doSomething(data: any): Promise<void> {
    }


}
```

On the side of Remix you define a plugin too. This is all you need to do

```
import { ElectronPlugin } from '@remixproject/engine-electron';

export class examplePlugin extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'exampleplugin',
      name: 'exampleplugin',
      description: 'exampleplugin',
    })
    this.methods = []

  }
}
```



### The engine

Here's an example. Important to note is the ipcMain handle which actually triggered by the peload script.
Check it out in remix: apps/remixdesktop/src/preload.ts
```

const engine = new Engine()
const appManager = new PluginManager()

const examplePlugin = new ExamplePlugin()
engine.register(appManager)
engine.register(examplePlugin)

ipcMain.handle('manager:activatePlugin', async (event, plugin) => {
  return await appManager.call(plugin, 'createClient', event.sender.id)
})

app.on('before-quit', async (event) => {
  await appManager.call('exampleplugin', 'doOnAllClients')
})

```

Preload script:
This script is included in the electron app and is loaded before the application. It is an isolated script that has access to the renderer process of electron and acts as the bridge between the application and the renderer.

```
import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

/* preload script needs statically defined API for each plugin */

const exposedPLugins = ['exampleplugin']

let webContentsId: number | undefined

ipcRenderer.invoke('getWebContentsID').then((id: number) => {
  webContentsId = id
})

contextBridge.exposeInMainWorld('electronAPI', {
  activatePlugin: (name: string) => {
    return ipcRenderer.invoke('manager:activatePlugin', name)
  },

  getWindowId: () => ipcRenderer.invoke('getWindowID'),

  plugins: exposedPLugins.map(name => {
    return {
      name,
      on: (cb:any) => ipcRenderer.on(`${name}:send`, cb),
      send: (message: Partial<Message>) => {
        ipcRenderer.send(`${name}:on:${webContentsId}`, message)
      }
    }
  })
})
```





