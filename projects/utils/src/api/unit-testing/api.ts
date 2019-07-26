import { UnitTestResult } from './type'
import { StatusEvents } from '../../types'

export interface IUnitTesting {
  events: {} & StatusEvents
  methods: {
    testFromPath(path: string): UnitTestResult
    testFromSource(sourceCode: string): UnitTestResult
  }
}
