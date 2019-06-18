import { Plugin, ICompiler, API, CompilationResult } from '@remixproject/engine'
import { EngineApi } from './engine.api'

export class CompilerPlugin extends Plugin<ICompiler, EngineApi> implements API<ICompiler> {
  getCompilationResult(): CompilationResult {
    return {} as CompilationResult
  }
  compile(fileName: string): void {}
}
