import { ModuleProfile, Profile } from '../remix-module'
import { ModuleService } from '../module'

export interface CompilerProfile extends ModuleProfile {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: {
    lastCompilationResult(): string
  },
  events: {
    compilationFinished: {success: boolean, data: any, source: any}
  }
  notifications: []
}

export interface CompilerService extends ModuleService<CompilerProfile> {}

export const compilerProfile: Profile<CompilerProfile> = {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished'],
  notifications: []
}