import { ModuleProfile, Api, API, ApiEventEmitter } from '../../src'
import { EventEmitter } from 'events'

// Type
export interface Compiler extends Api {
  type: 'solCompiler'
  events: {
    compilationFinished: { success: boolean; data: any; source: any }
  }
  lastCompilationResult(): any
}

// Profile
export const CompilerProfile: ModuleProfile<Compiler> = {
  type: 'solCompiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished']
}

// API
export class CompilerApi implements API<Compiler> {
  public readonly type = 'solCompiler'
  public events: ApiEventEmitter<Compiler> = new EventEmitter()

  constructor(private compiler) {}

  public lastCompilationResult() {
    return 'compilation'
  }
}