import { StatusEvents } from '@remixproject/plugin-utils'

export interface IVScodeExtAPI {
  events: {
  } & StatusEvents
  methods: {
    // Priority
    exec(extName: string, cmdName: string, payload: Array<any>): string
  }
}
