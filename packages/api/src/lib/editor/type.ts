export interface HighlightPosition {
  start: {
    line: number
    column: number
  }
  end: {
    line: number
    column: number
  }
}

export interface Annotation extends Error {
  row: number;
  column: number;
  text: string;
  type: "error" | "warning" | "information";
}