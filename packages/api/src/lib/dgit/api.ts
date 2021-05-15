import { StatusEvents } from "@remixproject/plugin-utils";
export interface IDgitSystem {
    events: StatusEvents
    methods: {
        init(): void;
        add(cmd: any): string;
        commit(cmd: any): string;
        status(cmd: any): any[];
        rm(cmd: any): string;
        log(cmd: any): any[];
        lsfiles(cmd: any): any[];
        readblob(cmd: any): { oid: string, blob: Uint8Array }
        resolveref(cmd: any): string
        branch(cmd: any): void
        checkout(cmd: any): void
        branches(): string[]
        currentbranch(): string
        push(): string
        pull(cmd: any): void
        setIpfsConfig(config:any): boolean
        zip():void
        setItem(name:string, content:string):void
        getItem(name:string):string
    };
}
