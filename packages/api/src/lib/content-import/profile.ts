import { IContentImport } from './api'
import { LibraryProfile } from '@remixproject/utils'

export const contentImportProfile: LibraryProfile<IContentImport> = {
  name: 'contentImport',
  methods: ['resolve'],
}
