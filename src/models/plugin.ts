export interface Plugin<T extends string> {
    title: T
    url?: string
    hash?: string
    version?: number
    imports: {
        type: string,
        key: string
    }[],
    exports: {
        action: 'notification' | 'request',
        type: T,
        key: string,
        params?: string[],
        permissioned: boolean
    }[]
}
