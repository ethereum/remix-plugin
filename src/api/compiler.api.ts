import { ModuleProfile, Profile } from '../remix-module'

export interface CompilerProfile extends ModuleProfile {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: {
    lastCompilationResult(): string
  },
  notifications: []
}

export const compilerProfile: Profile<CompilerProfile> = {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: ['lastCompilationResult'],
  notifications: []
}

export interface CompilerService {
  lastCompilationResult: string
  event: {
    register(event: 'compilationFinished', cb: (params: {success: boolean, data: any, source: any}) => void)
    trigger(event: 'compilationFinished', params: {success: boolean, data: any, source: any})
  }
}
