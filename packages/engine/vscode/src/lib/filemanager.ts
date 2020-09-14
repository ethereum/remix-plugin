import { filSystemProfile, IFileSystem } from '@remixproject/plugin-api'
import { MethodApi } from '@remixproject/plugin-utils';
import { window, workspace, Uri, commands } from 'vscode';
import { CommandPlugin } from './command';

export class FileManagerPlugin extends CommandPlugin implements MethodApi<IFileSystem> {
  constructor() {
    super(filSystemProfile);
  }
  /** Open the content of the file in the context (eg: Editor) */
  async open(path: string): Promise<void> {
    const uri = Uri.parse(path);
    return commands.executeCommand('vscode.open', uri);
  }
  /** Set the content of a specific file */
  async writeFile(path: string, data: string): Promise<void> {
    const uri = Uri.parse(path);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);
    return workspace.fs.writeFile(uri, Uint8Array.from(uint8Array));
  }
  /** Return the content of a specific file */
  async readFile(path: string): Promise<string> {
    const uri = Uri.parse(path);
    return workspace.fs.readFile(uri).then(content => Buffer.from(content).toString("utf-8"));
  }
  /** Change the path of a file */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const source = Uri.parse(oldPath);
    const target = Uri.parse(newPath);
    return workspace.fs.rename(source, target);
  }
  /** Upsert a file with the content of the source file */
  async copyFile(src: string, dest: string): Promise<void> {
    const source = Uri.parse(src);
    const target = Uri.parse(dest);
    return workspace.fs.copy(source, target);
  }
  /** Create a directory */
  async mkdir(path: string): Promise<void> {
    const uri = Uri.parse(path);
    return workspace.fs.createDirectory(uri);
  }
  /** Get the list of files in the directory */
  async readdir(path: string): Promise<string[]> {
    const uri = Uri.parse(path);
    return workspace.fs.readDirectory(uri).then(data => data.map(([path]) => path));
  }

  async getCurrentFile() {
    const fileName = window.activeTextEditor ? window.activeTextEditor.document.fileName : undefined;
    return fileName;
  }
  // ------------------------------------------
  // Legacy API. To be removed.
  // ------------------------------------------
  getFile = this.readFile
  setFile = this.writeFile;
  switchFile = this.open;
  /** @deprecated Use readdir instead */
  getFolder(path: string): Promise<any> {
    throw new Error('Get folder is not supported anymore')
  }
}