import { Injectable } from '@angular/core';
import { LibraryPlugin } from '@remixproject/engine';
import { LibraryProfile } from '@remixproject/plugin-utils';
import { EventEmitter } from 'events';
import { Engine } from '../engine';

interface Transaction {
  id: string;
}

class TransactionLibrary {
  private transactions: Transaction[] = [];
  events = new EventEmitter();

  sendTransaction(tx: Transaction) {
    this.transactions.push(tx);
    this.events.emit('newTransaction', tx)
  }

}

const profile: LibraryProfile = {
  name: 'library',
  methods: ['sendTransaction'],
  events: ['newTransaction']
}

@Injectable({ providedIn: 'root' })
export class Library extends LibraryPlugin {
  library: TransactionLibrary;
  constructor(engine: Engine) {
    const library = new TransactionLibrary();
    super(library, profile);
    engine.register(this);
  }

  onActivation() {
    this.library.sendTransaction({ id: "0" });
  }
}