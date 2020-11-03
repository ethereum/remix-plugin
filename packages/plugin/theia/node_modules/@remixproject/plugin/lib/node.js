"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginNode = void 0;
const plugin_utils_1 = require("@remixproject/plugin-utils");
/**
 * Access a service of an external plugin
 */
class PluginNode {
    /**
     * @param path Path to external plugin
     * @param client The main client used in this plugin
     */
    constructor(path, client) {
        this.path = path;
        this.client = client;
    }
    get(name) {
        return new PluginNode(`${this.path}.${name}`, this.client);
    }
    /** Call a method of the node */
    call(method, ...payload) {
        return this.client.call(this.path, method, payload);
    }
    /**
     * Listen to an event from the plugin
     * @note Event are trigger at the root level yet, not on a specific node
     */
    on(method, cb) {
        // Events are triggered at the root level for now
        this.client.on(plugin_utils_1.getRootPath(this.path), method, cb);
    }
}
exports.PluginNode = PluginNode;
//# sourceMappingURL=node.js.map