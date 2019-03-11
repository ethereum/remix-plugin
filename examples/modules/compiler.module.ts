import { ModuleProfile, Api, API, ApiEventEmitter, ApiFactory } from '../../src'
import { EventEmitter } from 'events'

// Type
export interface Compiler extends Api {
  name: 'solCompiler'
  events: {
    compilationFinished: { success: boolean; data: any; source: any }
  }
  lastCompilationResult(): any
}

// Profile
export const CompilerProfile: ModuleProfile<Compiler> = {
  name: 'solCompiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished']
}

// API
export class CompilerApi extends ApiFactory<Compiler> implements API<Compiler> {
  public readonly name = 'solCompiler'
  public readonly profile = CompilerProfile
  public events: ApiEventEmitter<Compiler> = new EventEmitter()

  public lastCompilationResult() {
    return 'compilation'
  }
}