export interface customAction {
    id: 'customAction',
    name: string,
    type?: customActionType[],
    path?: string[],
    extension?: string[],
    pattern?: string[]
}

export enum customActionType {
    "file",
    "folder"
}