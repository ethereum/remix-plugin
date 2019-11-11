
export type IPluginService<T extends Record<string, any> = any> = {
  methods: string[]
  path: string
} & T
