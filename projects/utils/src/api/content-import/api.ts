import { ContentImport } from './type'
import { StatusEvents } from '../../types'

export interface IContentImport {
  events: {} & StatusEvents
  methods: {
    resolve(path: string): ContentImport
  }
}
