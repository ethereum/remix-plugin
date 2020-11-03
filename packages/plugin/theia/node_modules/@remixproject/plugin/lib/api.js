"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiMap = exports.createApi = void 0;
/**
 * Create an Api
 * @param profile The profile of the api
 */
function createApi(client, profile) {
    if (typeof profile.name !== 'string') {
        throw new Error('Profile should have a name');
    }
    const on = (event, cb) => {
        client.on.call(client, profile.name, event, cb);
    };
    const methods = (profile.methods || []).reduce((acc, method) => (Object.assign(Object.assign({}, acc), { [method]: client.call.bind(client, profile.name, method) })), {});
    return Object.assign({ on }, methods);
}
exports.createApi = createApi;
/**
 * Transform a list of profile into a map of API
 * @deprecated Use `applyApi` from connector instead
 */
function getApiMap(client, profiles) {
    return Object.keys(profiles).reduce((acc, name) => {
        const profile = profiles[name];
        return Object.assign(Object.assign({}, acc), { [name]: createApi(client, profile) });
    }, {});
}
exports.getApiMap = getApiMap;
//# sourceMappingURL=api.js.map