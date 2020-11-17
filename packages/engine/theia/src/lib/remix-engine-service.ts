import { injectable } from 'inversify';
import {Engine, PluginManager, Plugin } from '@remixproject/engine';

@injectable()
export class RemixEngineService {
    engine: Engine;
    manager: PluginManager;

    constructor(){
    }

    async startEngine(){
        this.engine = new Engine();
        this.manager = new PluginManager;
    
        this.engine.register([this.manager])
    }
    
    async call(plugin:string,method:string, ...payload: any[]) {
        if (this.manager == undefined) {
            await this.startEngine()
        }
        this.manager.call(plugin, method, payload);
    }
}
