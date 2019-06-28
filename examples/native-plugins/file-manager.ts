import { filSystemProfile, IFileSystem, RemixApi, API, Folder } from '@utils'
import { Plugin } from '@remixproject/engine'

const fileManagerProfile = {
  ...filSystemProfile,
  name: 'fileManager',
  permission: true
}

export class FileManager extends Plugin<IFileSystem, RemixApi> implements API<IFileSystem> {
  private files: {
    [path: string]: string
  } = {}
  private active: string

  constructor() {
    super(fileManagerProfile)
  }

  getCurrentFile() {
    return this.files[this.active]
  }

  getFile(path: string) {
    return this.files[path]
  }

  getFolder(path: string) {
    return {} as Folder
  }

  switchFile(path: string) {
    this.active = path
    this.emit('currentFileChanged', path)
  }

  setFile(path: string, content: string) {
    this.files[path] = content
  }
}
