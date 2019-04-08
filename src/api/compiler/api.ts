import { BaseApi, extendsProfile } from "../base"
import { ModuleProfile, Api, API } from "../../types"
import { CompilationResult, CompilationSources } from "./type"

export interface ICompilerApi extends Api {
  events: {
    compilationFinished: (fileName: string, source: CompilationSources, languageVersion: string, data: CompilationResult) => void
  }
  getCompilationResult(): CompilationResult
}

export const compilerProfile: Partial<ModuleProfile<ICompilerApi>> = {
  kind: 'compiler',
  events: ['compilationFinished'],
  methods: ['getCompilationResult']
}

export abstract class CompilerApi extends BaseApi<ICompilerApi> implements API<ICompilerApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, compilerProfile)
    super(localProfile)
  }

  abstract getCompilationResult(): CompilationResult
}
