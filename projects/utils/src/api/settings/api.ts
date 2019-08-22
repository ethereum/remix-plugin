import { StatusEvents } from '../../types'

export interface ISettings {
  events: {} & StatusEvents
  methods: {
    getGithubAccessToken(): string
  }
}
