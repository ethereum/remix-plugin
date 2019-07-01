import { IEditor } from './api'
import { LibraryProfile } from '../../types'

export const editorProfile: LibraryProfile<IEditor> = {
  name: 'editor',
  methods: ['discardHighlight', 'highlight'],
}
