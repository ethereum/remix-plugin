import { ICompiler } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const compilerProfile: LibraryProfile<ICompiler> = {
  name: 'compiler',
  methods: ['compile', 'getCompilationResult'],
  events: ['compilationFinished']
}
