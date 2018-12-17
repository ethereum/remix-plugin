import { ModuleProfile, EventEmitter, Api, API } from '../../src'


// Type
export interface Compiler extends Api {
  type: 'solCompiler'
  compilationFinished: EventEmitter<{ success: boolean; data: any; source: any }>
  lastCompilationResult(): string
}

// Profile
export const CompilerProfile: ModuleProfile<Compiler> = {
  type: 'solCompiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished']
}

// API
export class CompilerApi extends API<Compiler> implements Compiler {
  constructor() {
    super('solCompiler')
  }

  public compilationFinished = new EventEmitter<{ success: boolean; data: any; source: any }>('compilationFinished')

  public lastCompilationResult() {
    return 'compilation'
  }

}