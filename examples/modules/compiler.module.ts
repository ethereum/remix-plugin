import { ModuleProfile, CompilerApi, CompilationResult, Api } from '../../src'

export interface Solidity extends Api {
  name: 'solidity',
  events: {}  // Need to add an empty one for autocompletion
  methods: {}
}

// Profile
export const CompilerProfile: ModuleProfile<Solidity> = {
  name: 'solidity',
}

// API
export class CompilerModule extends CompilerApi<Solidity> {
  // canCall is used for testing
  constructor(private canCall?: string[]) {
    super(CompilerProfile)
  }

  getCompilationResult(): CompilationResult {
    const { from } = this.currentRequest
    if (this.canCall && !this.canCall.includes(from)) {
      throw new Error(`${from} is not allowed to call 'lastCompilationResult'`)
    }
    return 'compilation' as any
  }
}