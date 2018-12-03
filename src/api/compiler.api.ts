import { ModuleProfile, ModuleApi } from '../remix-module'

export const CompilerProfile: ModuleProfile = {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: [],
  notifications: []
}

export interface Compiler {
  lastCompilationResult: any,
  event: {
    register(event: 'compilationFinished', cb)
  }
}

export class CompilerApi {

  constructor(private service: Compiler) {
    this.service.event.register('compilationFinished', this.compilationFinished)
  }

  public compilationFinished(success, data, source) {
    return { success, data, source }
  }

  public async getCompilationResult() {
    return this.service.lastCompilationResult
  }

}