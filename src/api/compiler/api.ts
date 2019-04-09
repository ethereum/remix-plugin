import { BaseApi, extendsProfile } from "../base"
import { ModuleProfile, Api, API } from "../../types"
import { CompilationResult, CompilationFileSources } from "./type"

export interface ICompilerApi extends Api {
  events: {
    compilationFinished: (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => void
  }
  getCompilationResult(): CompilationResult
}

export const compilerProfile: ModuleProfile<ICompilerApi> = {
  kind: 'compiler',
  events: ['compilationFinished'],
  methods: ['getCompilationResult']
}

export abstract class CompilerApi<T extends Api>
  extends BaseApi<T & ICompilerApi>
  implements API<ICompilerApi> {

  constructor(profile: ModuleProfile<T>) {
    const localProfile = extendsProfile(profile, compilerProfile)
    super(localProfile)
  }

  abstract getCompilationResult(): CompilationResult
}
