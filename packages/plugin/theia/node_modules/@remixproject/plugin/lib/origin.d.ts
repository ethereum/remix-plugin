import { PluginOptions } from "./client";
export declare const remixOrgins = "https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json";
/** Fetch the default origins for remix */
export declare function getOriginsFromUrl(url: string): Promise<any>;
export declare function getDevmodeOrigins({ devMode }: Partial<PluginOptions<any>>): string[];
/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param options client plugin options
 */
export declare function checkOrigin(origin: string, options?: Partial<PluginOptions<any>>): Promise<boolean>;
