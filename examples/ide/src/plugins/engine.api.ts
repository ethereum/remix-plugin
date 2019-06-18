import { ICompiler, IFileSystem } from '@remixproject/engine'

export type EngineApi = Readonly<{
  compiler: ICompiler,
  fileSystem: IFileSystem
}>
