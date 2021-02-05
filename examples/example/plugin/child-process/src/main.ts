import { createClient } from '@remixproject/plugin-child-process' 

const client = createClient()
client.onload(() => {
    console.log('loading...')
})