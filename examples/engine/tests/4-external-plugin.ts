import { PluginManager, Engine, IframePlugin, WebsocketPlugin } from '@remixproject/engine'
import { SidePanel } from './3-hosted-plugin'

test('[Example] Hosted Plugin', async () => {

  ///////////////////////////////////

  const manager = new PluginManager()
  const engine = new Engine(manager)
  const sidePanel = new SidePanel()

  // Iframe
  const ethdoc = new IframePlugin({
    name: 'ethdoc',
    location: 'sidePanel',
    url: 'ipfs://QmQmK435v4io3cp6N9aWQHYmgLxpUejjC1RmZCbqL7MJaM'
  })

  // Websocket
  const remixd = new WebsocketPlugin({
    name: 'remixd',
    url: 'wss://localhost:8000'
  })

  // wait for the manager to be loaded
  await engine.onload()
  engine.register([sidePanel, ethdoc, remixd])
  await manager.activatePlugin(['sidePanel', 'ethdoc', 'remixd'])

  ////////////////////////////////////

  // Note: By default remix engine reroute ipfs call to it's gateway
  expect(ethdoc['iframe'].src).toBe('https://ipfsgw.komputing.org/ipfs/QmQmK435v4io3cp6N9aWQHYmgLxpUejjC1RmZCbqL7MJaM')
  expect(remixd['socket']).toBeDefined()
})