import { ModuleProfile, Api, API, ApiEventEmitter } from '../../src'
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
export class CompilerApi implements API<Compiler> {
  public readonly name = 'solCompiler'
  public events: ApiEventEmitter<Compiler> = new EventEmitter()

  constructor() {}

  public lastCompilationResult() {
    return 'compilation'
  }
}