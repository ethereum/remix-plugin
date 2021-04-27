import { StatusEvents } from '@remixproject/plugin-utils'

export interface IVScodeExtAPI {
  events: {
  } & StatusEvents
  methods: {
    // Priority
    activate(): string
    deploy(): string
  }
}
