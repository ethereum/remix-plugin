import { Plugin, API, IFileSystem, Folder } from '@remixproject/engine'
import { EngineApi } from './engine.api'

export class FileSystemPlugin extends Plugin<IFileSystem, EngineApi> implements API<IFileSystem> {

  private files: { [path: string]: string } = {}

  getFolder(path: string): Folder {
    return Object.keys(this.files)
      .filter(name => name.includes(path))
      .reduce((acc, name) => {
        const isDirectory = typeof this.files[name] !== 'string'
        return { ...acc, [name]: { isDirectory } }
      }, {})
  }
  getCurrentFile(): string {
    return ''
  }
  getFile(path: string): string {
    return ''
  }
  setFile(path: string, content: string): void {}
  switchFile(path: string): void {}
}

