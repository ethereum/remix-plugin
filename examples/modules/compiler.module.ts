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
  public events: ApiEventEmitter<Compiler> = new EventEmitter() as any

  constructor(private canCall?: string[]) {
    super()
  }

  public lastCompilationResult() {
    const { from } = this.currentRequest
    if (this.canCall && !this.canCall.includes(from)) {
      throw new Error(`${from} is not allowed to call 'lastCompilationResult'`)
    }
    return 'compilation'
  }
}