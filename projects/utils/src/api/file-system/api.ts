import { Folder } from './type'
import { StatusEvents } from '../../types'

export interface IFileSystem {
  events: {
    currentFileChanged: (file: string) => void
  } & StatusEvents
  methods: {
    getFolder(path: string): Folder
    getCurrentFile(): string
    getFile(path: string): string
    setFile(path: string, content: string): void
    switchFile(path: string): void
  }
}
