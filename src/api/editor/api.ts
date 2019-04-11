import { BaseApi } from '../base'
import { extendsProfile } from "../profile"
import { ModuleProfile, Api, API } from '../../types'
import { HighlightPosition } from './type'

export interface IEditorApi extends Api {
  events: {}
  highlight(
    position: HighlightPosition,
    filePath: string,
    hexColor: string,
  ): void
  discardHighlight(): void
}

export const editorProfile: ModuleProfile<IEditorApi> = {
  kind: 'editor',
  methods: ['highlight', 'discardHighlight'],
}

export abstract class EditorApi<T extends Api>
  extends BaseApi<T & IEditorApi>
  implements API<IEditorApi> {

  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, editorProfile)
    super(localProfile)
  }

  /** Remove the current highlight if any, and add a new one */
  abstract highlight(
    position: HighlightPosition,
    filePath: string,
    hexColor: string,
  ): void
  /** Remove the current hightlight if any */
  abstract discardHighlight(): void
}
