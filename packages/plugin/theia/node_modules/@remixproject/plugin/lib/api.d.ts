import type { Profile, Api, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap } from '@remixproject/plugin-utils';
import { PluginClient } from './client';
/**
 * Create an Api
 * @param profile The profile of the api
 */
export declare function createApi<T extends Api>(client: PluginClient<any, any>, profile: Profile<T>): CustomApi<T>;
/**
 * Transform a list of profile into a map of API
 * @deprecated Use `applyApi` from connector instead
 */
export declare function getApiMap<T extends ProfileMap<App>, App extends ApiMap>(client: PluginClient<any, App>, profiles: T): PluginApi<ApiMapFromProfileMap<T>>;
