import { ApiFactory, Api, ModuleProfile, ApiEventEmitter } from 'remix-plugin'
import { EventEmitter } from 'events'

// API Interface
interface FileManagerApi extends Api {
  name: 'fileManager',
  events: {
    currentFileChanged: [string]
  }
  getFilesFromPath(path: string): string[]
  getCurrentFile(): string
  getFile(path: string): string
  setFile(path: string, content: string): void
}

// PROFILE
const fileManagerProfile: ModuleProfile<FileManagerApi> = {
  name: 'fileManager',
  displayName: 'File Manager',
  description: 'A simple browser File Manager',
  methods: ['getFilesFromPath', 'getCurrentFile', 'getFile', 'setFile'],
  events: ['currentFileChanged'],
}

// MODULE
export class FileManager extends ApiFactory<FileManagerApi> {
  private files: { [path: string]: string } = {}
  private active: string
  public readonly profile = fileManagerProfile
  public events: ApiEventEmitter<FileManagerApi> = new EventEmitter()

  /** Change the current file */
  public selectFile(path: string) {
    if (this.files[path]) throw new Error(`File ${path} doesn't exist`)
    this.active = path
    this.events.emit('currentFileChanged', this.active)
  }

  public getFilesFromPath(path: string): string[] {
    return Object.keys(this.files)
      .filter(name => name.includes(path))
      .map(name => this.files[name])
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


export class FileManagerComponent {
  constructor(private fileManager: FileManager) {}

}