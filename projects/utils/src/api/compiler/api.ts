import { CompilationResult, CompilationFileSources } from "./type"

export interface ICompiler {
  events: {
    compilationFinished: (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => void
  }
  methods: {
    getCompilationResult(): CompilationResult
    compile(fileName: string): void
  }
}
