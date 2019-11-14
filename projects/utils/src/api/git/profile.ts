import { IGitSystem } from './api'
import { LibraryProfile } from '../../types'

export const gitProfile: LibraryProfile<IGitSystem> = {
  name: 'remixd.git',
  methods: ['clone', 'checkout', 'init', 'add', 'commit', 'fetch', 'pull', 'push', 'reset', 'status', 'remote', 'log']
}
