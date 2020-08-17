import { HighlightPosition } from './type'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IEditor {
  events: {} & StatusEvents
  methods: {
    highlight(
      position: HighlightPosition,
      filePath: string,
      hexColor: string,
    ): void
    discardHighlight(): void
  }

}
