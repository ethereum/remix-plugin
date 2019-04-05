import { BaseApi, extendsProfile } from "../base"
import { ModuleProfile, Api, API } from "../../types"
import { CompilationResult } from "./type"

export interface ICompilerApi extends Api {
  events: {
    compilationFinished: [CompilationResult]
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
