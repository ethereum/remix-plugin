import { HighlightPosition } from './type'
import { StatusEvents } from '../../types'

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
