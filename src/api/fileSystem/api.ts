import { BaseApi, extendsProfile } from "../base"
import { ModuleProfile, Api, API } from "../../types"
import { Folder } from './type'

export interface IFileSystemApi extends Api {
  events: {
    currentFileChanged: (file: string) => void
  }
  getFolder(path: string): Folder
  getCurrentFile(): string
  getFile(path: string): string
  setFile(path: string, content: string): void
}

export const editorProfile: Partial<ModuleProfile<IFileSystemApi>> = {
  kind: 'fs',
  methods: ['getFolder', 'getCurrentFile', 'getFile', 'setFile']
}

export abstract class FileSystemApi extends BaseApi<IFileSystemApi> implements API<IFileSystemApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, editorProfile)
    super(localProfile)
  }

  abstract getFolder(path: string): Folder
  abstract getCurrentFile(): string
  abstract getFile(path: string): string
  abstract setFile(path: string, content: string): void
}
