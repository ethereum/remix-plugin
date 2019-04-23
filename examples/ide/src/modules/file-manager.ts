import { BaseApi, Api, ModuleProfile, ApiEventEmitter, IFileSystemApi, FileSystemApi, Folder } from 'remix-plugin'
import { EventEmitter } from 'events'

// API Interface
interface IFileManagerApi extends IFileSystemApi {
  name: 'fileManager',
}

// PROFILE
const profile: ModuleProfile<IFileManagerApi> = {
  name: 'fileManager',
}

// MODULE
export class FileManager extends FileSystemApi<IFileManagerApi> {
  private files: { [path: string]: string } = {}
  private active: string

  constructor() {
    super(profile)
  }

  /** Change the current file */
  public selectFile(path: string) {
    if (this.files[path]) throw new Error(`File ${path} doesn't exist`)
    this.active = path
    this.events.emit('currentFileChanged', this.active)
  }

  public getFolder(path: string): Folder {
    return Object.keys(this.files)
      .filter(name => name.includes(path))
      .reduce((acc, name) => {
        const isDirectory = typeof this.files[name] !== 'string'
        return { ...acc, [name]: { isDirectory } }
      }, {})
  }

  /** Get the content of the current file */
  public getCurrentFile(): string {
    return this.files[this.active]
  }

  /**  Get the content of the file */
  public getFile(path: string): string {
    if (!this.files[path]) throw new Error(`No file found for path ${path}`)
    return this.files[path]
  }

  /** Upsert a file @param path Path of the file */
  public setFile(path: string, content: string): void {
    this.files[path] = content
  }
}
