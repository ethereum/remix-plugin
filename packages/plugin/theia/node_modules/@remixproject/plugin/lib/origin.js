"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrigin = exports.getDevmodeOrigins = exports.getOriginsFromUrl = exports.remixOrgins = void 0;
const tslib_1 = require("tslib");
// Old link: 'https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json'
exports.remixOrgins = 'https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json';
/** Fetch the default origins for remix */
function getOriginsFromUrl(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        return res.json();
    });
}
exports.getOriginsFromUrl = getOriginsFromUrl;
function getDevmodeOrigins({ devMode }) {
    const localhost = devMode.port ? [
        `http://127.0.0.1:${devMode.port}`,
        `http://localhost:${devMode.port}`,
        `https://127.0.0.1:${devMode.port}`,
        `https://localhost:${devMode.port}`,
    ] : [];
    const devOrigins = devMode.origins
        ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
        : [];
    return [...localhost, ...devOrigins];
}
exports.getDevmodeOrigins = getDevmodeOrigins;
/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param options client plugin options
 */
function checkOrigin(origin, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let origins = [];
        if (options.allowOrigins) {
            if (Array.isArray(options.allowOrigins)) {
                origins = origins.concat(options.allowOrigins);
            }
            else {
                const allOrigins = yield getOriginsFromUrl(options.allowOrigins);
                origins = origins.concat(allOrigins);
            }
        }
        else if (options.devMode) {
            const devModes = getDevmodeOrigins(options);
            origins = origins.concat(devModes);
        }
        else {
            return true;
        }
        return origins.includes(origin);
    });
}
exports.checkOrigin = checkOrigin;
//# sourceMappingURL=origin.js.map