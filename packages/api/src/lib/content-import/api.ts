import { ContentImport } from './type'
import { StatusEvents } from '@remixproject/utils'

export interface IContentImport {
  events: {} & StatusEvents
  methods: {
    resolve(path: string): ContentImport
  }
}
