
export type IPluginService<T extends Record<string, any> = any> = {
  methods: string[]
  readonly path: string
} & T
