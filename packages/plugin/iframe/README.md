# Plugin frame
This library provides connectors to connect a plugin to an engine running in a web environment.
```
npm install @remixproject/plugin-iframe
```

If you do not expose any API you can create an instance like this :
```html
<script>
  const client = createClient(ws)
  client.onload(async () => {
    const data = client.call('filemanager', 'readFile', 'ballot.sol')
  })
</script>
```

If you need to expose an API to other plugin you need to extends the class: 
```html
<script>
  class MyPlugin extends PluginClient {
    methods = ['hello']
    hello() {
      console.log('Hello World')
    }
  }
  const client = createClient(ws)
  client.onload(async () => {
    const data = client.call('filemanager', 'readFile', 'ballot.sol')
  })
</script>
```