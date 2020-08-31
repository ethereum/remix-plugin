export interface Folder {
    [path: string]: {
      isDirectory: boolean;
    };
  }
  
  export interface RemixPosition {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  }
  
  export interface Annotation extends Error {
    row: number;
    column: number;
    text: string;
    type: "error" | "warning" | "information";
  }
  
  export interface ISource {
    content: string | undefined
  }
  export interface ISources {
    [key: string]: ISource
  }