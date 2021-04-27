import { IVScodeExtAPI } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const gitProfile: LibraryProfile<IVScodeExtAPI> = {
  name: 'vscextapi',
  methods: ['activate']
}
