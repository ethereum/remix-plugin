import { StatusEvents } from '@remixproject/utils'

export interface ISettings {
  events: {} & StatusEvents
  methods: {
    getGithubAccessToken(): string
  }
}
