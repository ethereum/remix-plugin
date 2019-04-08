import { BaseApi, extendsProfile } from "../base"
import { ModuleProfile, Api, API } from "../../types"
import { HighlightPosition } from './type'

export interface IEditorApi extends Api {
  highlight(position: HighlightPosition, filePath: string, hexColor: string): void
  discardHighlight(): void
}

export const editorProfile: Partial<ModuleProfile<IEditorApi>> = {
  kind: 'editor',
  methods: ['highlight', 'discardHighlight']
}

export abstract class EditorApi extends BaseApi<IEditorApi> implements API<IEditorApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, editorProfile)
    super(localProfile)
  }

  /** Remove the current highlight if any, and add a new one */
  abstract highlight(position: HighlightPosition, filePath: string, hexColor: string): void
  /** Remove the current hightlight if any */
  abstract discardHighlight(): void
}
