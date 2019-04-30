import { ICompilerApi, ModuleProfile, CompilerApi, CompilationResult, CompilationInput, Status } from "remix-plugin"
import * as wrapper from 'solc/wrapper'


// API Interface
interface ISolidityApi extends ICompilerApi {
  name: 'solidity',
}

// PROFILE
const profile: ModuleProfile<ISolidityApi> = {
  name: 'solidity',
}

const status: { [name: string]: Status } = {
  compiling: {
    key: 'spinner',
    type: 'info',
    title: 'compiling'
  },
  success: {
    key: 'check',
    type: 'success',
    title: 'compilation succeed'
  }
}

// MODULE
export class SolidityApi extends CompilerApi<ISolidityApi> {

  private compiler
  private compilationResult: CompilationResult

  constructor() {
    super(profile)
    this.compiler = wrapper((window as any).Module)
  }

  compile(input: CompilationInput) {
    this.events.emit('statusChanged', status['compiling'])
    const output = this.compiler.compile(JSON.stringify(input))
    this.compilationResult = JSON.parse(output)
    this.events.emit('statusChanged', status['success'])
    // this.events.emit('compilationFinished', this.compilationResult)
  }

  getCompilationResult(): CompilationResult {
    return this.compilationResult
  }

}
