import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { Engine, PluginManager } from '@remixproject/engine'
import { ChildProcessPlugin } from '@remixproject/engine-node'

const engine = new Engine()
const manager = new PluginManager()
engine.register(manager)

const app: express.Application = express()
const port = 2002

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({
        status: 200,
        message: 'Service is up!',
    }))
})

// listen to port
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`)
    const plugin = new ChildProcessPlugin({
        name: 'child_process',
        url: './dist/examples/example/plugin/child-process/main.js'
    })
    
    engine.register(plugin)
    manager.activatePlugin('child_process')
})