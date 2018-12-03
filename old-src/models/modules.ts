import { Tx, CompilationResult } from './types'

/**
 * MODULE BASE
 */

interface ModuleEvents {
    [name: string]: Function
}

export interface Module<E extends ModuleEvents> {
    event: {
        register<EventName extends keyof ModuleEvents>(event: EventName, cb: ModuleEvents[EventName])
    }
}

/**
 * APP
 */

interface AppModuleEvents extends ModuleEvents {
    newTransaction(tx: Tx): any
    tabChanged(tabName: Tx): any
}

export type AppModule = Module<AppModuleEvents>

/**
 * File Provider
 */

export interface FileProviderModule {
    config: {
        set(path: string, content: string),
        get(path),
        remove(path)
    }
}

/**
 * File Manager
 */

interface FileManagerModuleEvents extends ModuleEvents {
    currentFileChanged(file: string, provider: object): any
}

export interface FileManagerModule extends Module<FileManagerModuleEvents> {
    filesFromPath(path: string, cb: Function)
    currentFile()
    fileProviderOf(path: string)
    syncEditor(path: string)
}

/**
 * Compiler
 */

interface CompilerModuleEvents extends ModuleEvents {
    compilationFinished(
        success: boolean,
        data: CompilationResult['contracts'],
        source: CompilationResult['sources'],
      ): any
}

export interface CompilerModule {
    lastCompilationResult: CompilationResult
}


/**
 * Udapp
 */

export interface UdappModule {
    silentRunTx(tx: Tx, cb: (err: string, result: any) => any)
    getAccounts(cb: (addresses: string[]) => any)
    createVMAccount(privateKey: string, balance: string, cb: (err: string, address: string) => any)
}