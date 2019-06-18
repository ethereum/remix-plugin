import { HighlightPosition } from './type'

export interface IEditor {
  events: {}
  methods: {
    highlight(
      position: HighlightPosition,
      filePath: string,
      hexColor: string,
    ): void
    discardHighlight(): void
  }

}
