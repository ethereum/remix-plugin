import {
  ICompiler,
  RemixApi,
  API,
  CompilationResult,
  compilerProfile,
  CompilationInput,
  SourcesInput,
} from '@utils'
import { Plugin } from '@remixproject/engine'

const mockCompiler = {
  compile(input: string) {
    const data = JSON.parse(input) as CompilationInput
    return JSON.stringify({
      sources: data.sources,
      contracts: {},
    })
  },
}

export const solidityProfile = { ...compilerProfile, name: 'solidity' }

export class Solidity extends Plugin<ICompiler, RemixApi> implements API<ICompiler> {
  public isActive = false

  constructor() {
    super(solidityProfile)
  }

  private compilerInput(sources: SourcesInput): string {
    return JSON.stringify(<CompilationInput>{
      language: 'Solidity',
      sources,
    })
  }

  getCompilationResult(): CompilationResult {
    return {} as any
  }

  async compile(path: string) {
    const content = await this.app.fileManager.getFile(path) // this.call('fileManager', 'getFile', name)
    const name = path.split('/')[path.split('/').length - 1]
    const sources = { [name]: { content } }
    const input = this.compilerInput(sources)
    const output = mockCompiler.compile(input)
    const result = JSON.parse(output) as CompilationResult
    this.emit('compilationFinished', name, { [name]: content }, '', result)
  }

  onActivation() {
    this.isActive = true
  }

  onDeactivation() {
    this.isActive = false
  }
}
