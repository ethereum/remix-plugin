import { IFileSystem } from './api'
import { LibraryProfile } from '@remixproject/utils'

export const filSystemProfile: LibraryProfile<IFileSystem> = {
  name: 'fs',
  methods: ['getCurrentFile', 'getFile', 'getFolder', 'setFile', 'switchFile'],
  events: ['currentFileChanged']
}
