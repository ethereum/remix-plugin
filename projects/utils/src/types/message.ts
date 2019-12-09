export interface PluginRequest {
  /** The name of the plugin making the request */
  from: string,
  /** @deprecated Will be remove in the next version */
  isFromNative?: boolean,
  /** The path to access the request inside the plugin */
  path?: string
}

export interface Message {
  id: number
  action: 'notification' | 'request' | 'response' | 'listen'
  name: string
  key: string
  payload: any
  requestInfo: Partial<PluginRequest>
  error?: Error | string
}
