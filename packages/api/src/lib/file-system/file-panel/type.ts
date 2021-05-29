export interface customAction {
    id: string,
    name: string,
    type: customActionType[],
    path: string[],
    extension: string[],
    pattern: string[],
    sticky?: boolean
}

export type customActionType = 'file' | 'folder'