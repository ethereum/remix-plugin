import { MethodKey, Api, ApiMap, EventKey } from './api'

/** Describe a plugin */
export interface Profile<T extends Api = any> {
  name: string
  methods: MethodKey<T>[]
  permission?: boolean
  hash?: string
}

export interface ViewProfile<T extends Api = any> extends Profile<T> {
  location: string
}

export interface IframeProfile<T extends Api = any> extends ViewProfile<T> {
  url: string
}

export interface HostProfile extends Profile {
  methods: ('addView' | 'removeView' | 'focus')[]
}

export interface LibraryProfile<T extends Api = any> extends Profile<T> {
  events?: EventKey<T>[]
  notifications?: {
    [name: string]: string[]
  }
}


/** A map of profile */
export type ProfileMap<T extends ApiMap> = {
  [name in keyof T]: Profile<T[name]>
}

// PROFILE TO API

/** Extract the API of a profile */
export type ApiFromProfile<T> = T extends Profile<infer I> ? I : never
/** Create an ApiMap from a Profile Map */
export type ApiMapFromProfileMap<T extends ProfileMap<any>> = {
  [name in keyof T]: ApiFromProfile<T[name]>
}

/** Transform an ApiMap into a profile map */
export type ProfileMapFromApiMap<T extends ApiMap> = Readonly<{
  [name in keyof T]: Profile<T[name]>
}>
