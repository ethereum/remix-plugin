import { Folder } from './type'

export interface IFileSystem {
  events: {
    currentFileChanged: (file: string) => void
  }
  methods: {
    getFolder(path: string): Folder
    getCurrentFile(): string
    getFile(path: string): string
    setFile(path: string, content: string): void
    switchFile(path: string): void
  }
}
