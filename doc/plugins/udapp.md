# Udapp

- Name in Remix: `udapp`
- kind: `udapp`

The udapp exposes an interface for interacting with the account and transaction.

|Type     |Name                 |Description
|---------|---------------------|--
|_event_  |`newTransaction`     |Triggered when a new transaction has been sent.
|_method_ |`sendTransaction`    |Send a transaction **only for testing networks**.
|_method_ |`getAccounts`        |Get an array with the accounts exposed.
|_method_ |`createVMAccount`    |Add an account if using the VM provider. 

## Examples

### Events
`newTransaction`: Triggered when a new transaction has been sent.
```typescript
client.solidity.on('sendTransaction', (tx: RemixTx) => {
  // Do something
})
// OR
client.listen('udapp', 'sendTransaction', (tx: RemixTx) => {
  // Do something
})
```

### Methods
`sendTransaction`: Send a transaction **only for testing networks**.
```typescript
const transaction: RemixTx = {
  gasLimit: '0x2710',
  from: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  to: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c'
  data: '0x...',
  value: '0x00',
  useCall: false
}
const receipt = await client.udapp.sendTransaction(transaction)
// OR
const receipt = await client.call('udapp', 'sendTransaction', transaction)
```

`getAccounts`: Get the name of the current file selected.
```typescript
const accounts = await client.udapp.getAccounts()
// OR
const accounts = await client.call('udapp', 'getAccounts')
```

`createVMAccount`: Get the content of a file.
```typescript
const address = await client.udapp.createVMAccount()
// OR
const address = await client.call('udapp', 'createVMAccount')
```

## Types
`RemixTx`: A modified version of the transaction for Remix.
`RemixTxReceipt`: A modified version of the transaction receipt for Remix.


> Type Definitions can be found [here](../../src/api/udapp/type.ts)