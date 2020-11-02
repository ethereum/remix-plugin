import { filSystemProfile, IFileSystem } from '@remixproject/plugin-api'
import { MethodApi } from '@remixproject/plugin-utils';
import { isAbsolute, join } from 'path';
import * as theia from '@theia/plugin';
import { CommandPlugin } from './command';

function absolutePath(path: string) {
  const root = theia.workspace.workspaceFolders[0].uri.fsPath;
  if (isAbsolute(path) || !root) {
    return path;
  }
  return join(root, path);
}

export class FileManagerPlugin extends CommandPlugin implements MethodApi<IFileSystem> {
  constructor() {
    super(filSystemProfile);
  }
  /** Open the content of the file in the context (eg: Editor) */
  async open(path: string): Promise<void> {
    const absPath = absolutePath(path);
    const uri = theia.Uri.file(absPath);
    return theia.commands.executeCommand('theia.open', uri);
  }
  /** Set the content of a specific file */
  async writeFile(path: string, data: string): Promise<void> {
    const absPath = absolutePath(path);
    const uri = theia.Uri.file(absPath);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);
    return theia.workspace.fs.writeFile(uri, Uint8Array.from(uint8Array));
  }
  /** Return the content of a specific file */
  async readFile(path: string): Promise<string> {
    const absPath = absolutePath(path);
    const uri = theia.Uri.file(absPath);
    return theia.workspace.fs.readFile(uri).then(content => Buffer.from(content).toString("utf-8"));
  }
  /** Change the path of a file */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const source = theia.Uri.file(absolutePath(oldPath));
    const target = theia.Uri.file(absolutePath(newPath));
    return theia.workspace.fs.rename(source, target);
  }
  /** Upsert a file with the content of the source file */
  async copyFile(src: string, dest: string): Promise<void> {
    const source = theia.Uri.file(absolutePath(src));
    const target = theia.Uri.file(absolutePath(dest));
    return theia.workspace.fs.copy(source, target);
  }
  /** Create a directory */
  async mkdir(path: string): Promise<void> {
    const uri = theia.Uri.file(absolutePath(path));
    return theia.workspace.fs.createDirectory(uri);
  }
  /** Get the list of files in the directory */
  async readdir(path: string): Promise<string[]> {
    const absPath = absolutePath(path);
    const uri = theia.Uri.file(absPath);
    return theia.workspace.fs.readDirectory(uri).then(data => data.map(([path]) => path));
  }

  async getCurrentFile() {
    const fileName = theia.window.activeTextEditor ? theia.window.activeTextEditor.document.fileName : undefined;
    return fileName;
  }

  getFile = this.readFile
  setFile = this.writeFile;
  switchFile = this.open;
  /** @deprecated Use readdir instead */
  getFolder(path: string): Promise<any> {
    throw new Error('Get folder is not supported anymore')
  }
}
