import { PluginProfile, RemixExtension } from "../../src"
import { Api } from '../../src'

export interface VyperCompiler extends Api {
  name: 'vyperCompiler'
  events: {
    compilationFinished: (compilationResult: any) => void
  }
  lastCompilationResult(): any
}

export const VyperCompilerProfile: PluginProfile<VyperCompiler> = {
  name: 'vyperCompiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished'],
  url: ''
}
