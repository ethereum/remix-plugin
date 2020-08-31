import { Folder } from "./type";
import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, workspace, Uri, FileType, commands, FileStat } from "vscode";

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
 */

export default class FileManagerPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  /** Open the content of the file in the context (eg: Editor) */
  open(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let uri = Uri.file(path);
      commands.executeCommand('vscode.open', uri)
        .then(() => {
          resolve(true);
        })
    })
  }
  /** Set the content of a specific file */
  writeFile(path: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const turi = Uri.parse(path);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(data);
      workspace.fs.writeFile(turi, Uint8Array.from(uint8Array)).then(() => {
        resolve();
      });
    });
  }
  /** Return the content of a specific file */
  readFile(path: string): Promise<String> {
    return new Promise((resolve, reject) => {
      const furi = Uri.parse(path);
      workspace.fs.readFile(furi).then((content) => {
        const b = Buffer.from(content);
        const bs = b.toString("utf-8");
        resolve(bs);
      });
    });
  }
  /** Change the path of a file */
  rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const source = Uri.parse(oldPath);
      const target = Uri.parse(newPath);
      workspace.fs.rename(source, target)
        .then(() => {
          resolve();
        });
    });
  }
  /** Upsert a file with the content of the source file */
  copyFile(src: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const source = Uri.parse(src);
      const target = Uri.parse(dest);
      workspace.fs.copy(source, target).then(() => {
        resolve();
      });
    });
  }
  /** Create a directory */
  mkdir(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const duri = Uri.parse(path);
      workspace.fs.createDirectory(duri).then(() => {
        resolve();
      });
    });
  }
  /** Get the list of files in the directory */
  readdir(path: string): Promise<[string, FileType][]> {
    return new Promise((resolve, reject) => {
      const duri = Uri.parse(path);
      workspace.fs.readDirectory(duri).then((data) => {
        resolve(data);
      });
    });
  }
  // ------------------------------------------
  // Legacy API. To be removed.
  // ------------------------------------------
  async getFolder(path: string): Promise<Folder> {
    try {
      const duri = Uri.parse(path);
      const filestat: FileStat = await workspace.fs.stat(duri);
      let folder: Folder;
      folder[path] = {
        isDirectory: filestat.type == FileType.Directory ? true : false,
      }
      return folder;
    } catch (error) {
      throw error;
    }
  }
  getCurrentFile(): string {
    const fileName = window.activeTextEditor ? window.activeTextEditor.document.fileName : undefined;
    return fileName;
  }
  async getFile(path: string): Promise<string> {
    try {
      const furi = Uri.parse(path);
      const content = await workspace.fs.readFile(furi);
      const b = Buffer.from(content);
      const bs = b.toString("utf-8");
      return bs;
    } catch (error) {
      throw error;
    }
  }
  setFile(path: string, content: string): void {
    return;
  }
  switchFile(path: string): void {
    return;
  }
}