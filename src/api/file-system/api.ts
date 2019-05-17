import { BaseApi } from '../base'
import { extendsProfile } from "../profile"
import { ModuleProfile, Api, API } from '../../types'
import { Folder } from './type'

export interface IFileSystemApi extends Api {
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

export const fileSystemProfile: ModuleProfile<IFileSystemApi> = {
  name: 'fs', // Will be removed when extended
  kind: 'fs',
  events: ['currentFileChanged'],
  methods: ['getFolder', 'getCurrentFile', 'getFile', 'setFile', 'switchFile'],
}

export abstract class FileSystemApi<T extends Api>
  extends BaseApi<T & IFileSystemApi>
  implements API<IFileSystemApi> {

  constructor(profile: ModuleProfile<T>) {
    const localProfile = extendsProfile(profile, fileSystemProfile)
    super(localProfile)
  }

  /** Get the folder object of a path */
  abstract getFolder(path: string): Folder
  /** Get the name of a file */
  abstract getCurrentFile(): string
  /** Get the content of a file */
  abstract getFile(path: string): string
  /** Set the content of a file */
  abstract setFile(path: string, content: string): void
  /** Switch the current file to a new one */
  abstract switchFile(path: string): void

}
