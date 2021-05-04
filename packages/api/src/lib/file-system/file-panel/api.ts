import { StatusEvents } from '@remixproject/plugin-utils'
export interface IFilePanel {
    events: {
        setWorkspace: (workspace:any) => void
        renameWorkspace: (workspace:any) => void
        deleteWorkspace: (workspace:any) => void
        createWorkspace: (workspace:any) => void
    } & StatusEvents
    methods: {
        getCurrentWorkspace(): { name: string, isLocalhost: boolean }
        getWorkspaces(): string[]
        createWorkspace(name:string): void
        renameWorkspace(oldName:string, newName:string): void
    }
}