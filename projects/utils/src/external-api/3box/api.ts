import { StatusEvents } from '../../types'

export interface IBox {
  events: {
    enabled(): void,
    loggedIn(): void,
    loggedOut(): void,
    spaceOpened(spaceName: string): void
    spaceClosed(spaceName: string): void
  } & StatusEvents
  methods: {
    login(): boolean
    getUserAddress(): string
    isEnabled(): boolean
    isSpaceOpened(): boolean
    openSpace(): boolean
    closeSpace(): boolean
    getSpacePrivateValue<Box extends Record<string, string> = any>(key: Extract<keyof Box, string>): string
    setSpacePrivateValue<Box extends Record<string, string> = any>(key: Extract<keyof Box, string>, value: string): boolean
    getSpacePublicValue<Box extends Record<string, string> = any>(key: Extract<keyof Box, string>): string
    setSpacePublicValue<Box extends Record<string, string> = any>(key: Extract<keyof Box, string>, value: string): boolean
    getSpacePublicData(address: string, spaceName: string): Record<string, string>
    getSpaceName(): string
  }
}
