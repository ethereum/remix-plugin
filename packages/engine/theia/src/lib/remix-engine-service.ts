import { injectable } from 'inversify';
import {Engine, PluginManager } from '@remixproject/engine';
import { FileManagerPlugin } from './filemanager';
import { TerminalPlugin } from './terminal';

@injectable()
export class RemixEngineService {
    engine: Engine;
    manager: PluginManager;

    constructor(){
    }

    async startEngine(){
        this.engine = new Engine
        this.manager = new PluginManager
        let fileManager = new FileManagerPlugin
        let terminal = new TerminalPlugin;

        this.engine.register([this.manager, fileManager, terminal])
    }
    
    async call(plugin:string,method:string, ...payload: any[]) {
        if (this.manager == undefined) {
            await this.startEngine()
        }
        this.manager.call(plugin, method, payload);
    }
}
