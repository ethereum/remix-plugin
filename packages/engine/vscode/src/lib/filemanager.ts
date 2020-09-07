import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, workspace, Uri, FileType, commands } from "vscode";

const profile = {
  name: "fileManager",
  displayName: "Native Filemanager for Remix vscode plugin",
  description: "Provides communication between vscode filemanager and remix-plugin",
  kind: "filemanager",
  permission: true,
  location: "sidePanel",
  documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: [
    "getFolder",
    "getCurrentFile",
    "getFile",
    "setFile",
    "switchFile",
    // NextFileSystemAPI
    "open",
    "writeFile",
    "readFile",
    "rename",
    "copyFile",
    "mkdir",
    "readdir",
  ],
};

/**
 * TODO:
 * it should be possible to install https://github.com/ethereum/remix-plugins-directory and
 * import `NextFileSystemApi` interface and implement `FileManagerPlugin` following that interface
 * `export default class FileManagerPlugin extends CommandPlugin implements NextFileSystemApi`
 * 
 */

export default class FileManagerPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  /** Open the content of the file in the context (eg: Editor) */
  open(path: string): Thenable<boolean> {
    const uri = Uri.parse(path);
    return commands.executeCommand('vscode.open', uri).then(() => true);
  }
  /** Set the content of a specific file */
  writeFile(path: string, data: string): Thenable<void> {
    const uri = Uri.parse(path);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);
    return workspace.fs.writeFile(uri, Uint8Array.from(uint8Array));
  }
  /** Return the content of a specific file */
  readFile(path: string): Thenable<String> {
    const uri = Uri.parse(path);
    return workspace.fs.readFile(uri).then(content => Buffer.from(content).toString("utf-8"));
  }
  /** Change the path of a file */
  rename(oldPath: string, newPath: string): Thenable<void> {
    const source = Uri.parse(oldPath);
    const target = Uri.parse(newPath);
    return workspace.fs.rename(source, target);
  }
  /** Upsert a file with the content of the source file */
  copyFile(src: string, dest: string): Thenable<void> {
    const source = Uri.parse(src);
    const target = Uri.parse(dest);
    return workspace.fs.copy(source, target);
  }
  /** Create a directory */
  mkdir(path: string): Thenable<void> {
    const uri = Uri.parse(path);
    return workspace.fs.createDirectory(uri);
  }
  /** Get the list of files in the directory */
  readdir(path: string): Thenable<[string, FileType][]> {
    const uri = Uri.parse(path);
    return workspace.fs.readDirectory(uri).then(data => data);
  }
  // ------------------------------------------
  // Legacy API. To be removed.
  // ------------------------------------------
  getFolder = this.readdir;
  getFile = this.readFile;
  setFile = this.writeFile;
  switchFile = this.open;
  getCurrentFile(): string {
    const fileName = window.activeTextEditor ? window.activeTextEditor.document.fileName : undefined;
    return fileName;
  }
}