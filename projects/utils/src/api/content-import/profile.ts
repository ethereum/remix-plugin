import { IContentImport } from './api'
import { LibraryProfile } from '../../types'

export const contentImportProfile: LibraryProfile<IContentImport> = {
  name: 'contentImport',
  methods: ['resolve'],
}
