import { IUnitTesting } from './api'
import { LibraryProfile } from '@remixproject/utils'

export const unitTestProfile: LibraryProfile<IUnitTesting> = {
  name: 'unitTest',
  methods: ['testFromPath', 'testFromSource'],
}
