export interface PluginRequest {
  from: string,
  isFromNative: boolean
}

export interface Message {
  id: number
  action: 'notification' | 'request' | 'response' | 'listen'
  name: string
  key: string
  payload: any
  requestInfo: PluginRequest
  error?: Error
}
