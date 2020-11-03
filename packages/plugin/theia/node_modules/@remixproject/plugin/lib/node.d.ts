import { PluginClient } from "./client";
/**
 * Access a service of an external plugin
 */
export declare class PluginNode {
    private path;
    private client;
    /**
     * @param path Path to external plugin
     * @param client The main client used in this plugin
     */
    constructor(path: string, client: PluginClient);
    get(name: string): PluginNode;
    /** Call a method of the node */
    call(method: string, ...payload: any[]): Promise<any>;
    /**
     * Listen to an event from the plugin
     * @note Event are trigger at the root level yet, not on a specific node
     */
    on(method: string, cb: Function): void;
}
