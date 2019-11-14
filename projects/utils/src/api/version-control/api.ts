import { StatusEvents } from '../../types'

export interface IVersionControllSystem {
  events: {
    //TODO:
  } & StatusEvents
  methods: {
    //Priority
    gitClone(url: string): void
    gitCheckout(cmd: string): void // Switch branches or restore working tree files
    gitInit(): void
    gitAdd(cmd: string): void 
    gitCommit(cmd: string): void
    gitFetch(cmd: string): void
    gitPull(cmd: string): void
    gitPush(cmd: string): void
    gitReset(cmd: string): void
    gitStatus(cmd: string): void
    gitRemote(cmd: string): void 
    gitLog(): void

    //Less priority
    /*
    gitMv(cmd: string): void //Move or rename a file, a directory, or a symlink
    gitRm(cmd: string)
    gitConfig(cmd: string): void //Get and set repository or global options
    gitBranch(cmd: string): void
    gitMerge(cmd: string): void
    gitRebase(cmd: string): void
    gitSwitch(cmd: string): void
    gitTag(cmd: string): void
    gitBlame(cmd: string): void
    */
  }
}
