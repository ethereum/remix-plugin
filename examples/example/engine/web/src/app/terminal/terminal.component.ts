import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Manager, Terminal } from '../plugins';

@Component({
  selector: 'engine-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalComponent {
  form = new FormControl();
  constructor(
    private manager: Manager,
    private terminal: Terminal
  ) { }

  async submit() {
    await this.manager.activatePlugin('terminal');
    this.terminal.call('iframe', 'execute', this.form.value);
    this.form.reset();
  }

}
