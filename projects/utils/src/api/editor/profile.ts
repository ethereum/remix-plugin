import { IEditor } from './api'
import { LibraryProfile } from '@utils'

export const editorProfile: LibraryProfile<IEditor> = {
  name: 'editor',
  methods: ['discardHighlight', 'highlight'],
}
