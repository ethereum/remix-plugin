import { StatusEvents } from '@remixproject/plugin-utils'
import { customAction } from './type';
export interface IFilePanel {
    events: {
        setWorkspace: (workspace:any) => void
        renameWorkspace: (workspace:any) => void
        deleteWorkspace: (workspace:any) => void
        createWorkspace: (workspace:any) => void
        customAction: (cmd: customAction) => void
    } & StatusEvents
    methods: {
        getCurrentWorkspace(): { name: string, isLocalhost: boolean, absolutePath: string }
        getWorkspaces(): string[]
        deleteWorkspace(name:string): void
        createWorkspace(name:string, isEmpty:boolean): void
        renameWorkspace(oldName:string, newName:string): void
        registerContextMenuItem(cmd: customAction): void
    }
}
