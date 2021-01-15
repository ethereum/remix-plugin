import { StatusEvents } from '@remixproject/plugin-utils'
import {Transaction} from "./type";

export interface ITerminal {
  events: {} & StatusEvents;
  methods: {
    logTx(tx: Transaction): void;
    logHtml(msg: string): void;
  };
}
