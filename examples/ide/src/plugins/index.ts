import { PluginEngine } from '@remixproject/engine'
import { CompilerPlugin } from './compiler.plugin'
import { FileSystemPlugin } from './file-system.plugin'
import { EngineApi } from './engine.api'


const compiler = new CompilerPlugin({
  name: 'compiler',
  methods: []
})

const fileSystem = new FileSystemPlugin({
  name: 'fs',
  methods: []
})

const engine = new PluginEngine<EngineApi>({
  compiler,
  fileSystem
})
