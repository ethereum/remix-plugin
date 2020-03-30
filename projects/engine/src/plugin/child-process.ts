import { ExternalPlugin } from './external'
import { Message } from '../../../utils/src/types/message'
import { ChildProcess, fork } from 'child_process'

type MessageListener = ['message', (msg: Message) => void]

export class ChildProcessPlugin extends ExternalPlugin {
  private readonly listener: MessageListener = ['message', msg => this.getMessage(msg)]
  process: ChildProcess
  async activate() {
    this.process = fork(this.profile.url)
    this.process.on(...this.listener)
    super.activate()
  }

  deactivate() {
    this.process.off(...this.listener)
    super.deactivate()
  }

  protected postMessage(message: Partial<Message>): void {
    if (!this.process.connected) {
      throw new Error(`Child process form plugin ${this.name} is not yet connected`)
    }
    this.process.send(message)
  }

}