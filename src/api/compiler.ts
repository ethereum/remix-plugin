import { BaseApi, extendsProfile } from "./base"
import { ModuleProfile, Api, API } from "src/types"

export interface ICompilerApi extends Api {
  events: {
    compilationFinished: []
  }
  getCompilationResult(): any
}

export const compilerProfile: Partial<ModuleProfile<ICompilerApi>> = {
  events: ['compilationFinished'],
  methods: ['getCompilationResult']
}

export abstract class CompilerApi extends BaseApi<ICompilerApi> implements API<ICompilerApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, compilerProfile)
    super(localProfile)
  }

  abstract getCompilationResult(): any
}
