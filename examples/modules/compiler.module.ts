import { ModuleProfile, Profile, ModuleService } from '../../src'

/* ------- TYPES ------- */

export interface CompilerProfile extends ModuleProfile {
  displayName: 'Solidity Compiler'
  icon: 'compiler'
  type: 'sol-compiler'
  methods: {
    lastCompilationResult(): string
  }
  events: {
    compilationFinished: { success: boolean; data: any; source: any }
  }
  notifications: []
}

export interface ICompilerService extends ModuleService<CompilerProfile> {}

/* ------- IMPLEMENTATION ------- */

/**
 * PROFILE
 */

export const compilerProfile: Profile<CompilerProfile> = {
  displayName: 'Solidity Compiler',
  icon: 'compiler',
  type: 'sol-compiler',
  methods: ['lastCompilationResult'],
  events: ['compilationFinished'],
  notifications: [],
}

/**
 * SERVICE as a class
 */
export class CompilerService implements ICompilerService {
  event = {
    registered: {},
    unregister(e: 'compilationFinished') {
      delete this.register[e]
    },
    register(
      e: 'compilationFinished',
      cb: (value: { success: boolean; data: any; source: any }) => any,
    ) {
      this.registered[e] = cb
    },
    trigger(
      e: 'compilationFinished',
      params: { success: boolean; data: any; source: any },
    ) {
      this.registered[e](params)
    },
  }
  lastCompilationResult() {
    return 'last'
  }
}