import { IUnitTesting } from './api'
import { LibraryProfile } from '../../types'

export const unitTestProfile: LibraryProfile<IUnitTesting> = {
  name: 'unitTest',
  methods: ['testFromPath', 'testFromSource'],
}
