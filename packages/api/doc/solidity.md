# Solidity Compiler

- Name in Remix: `solidity`
- kind: `compiler`


|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`compilationFinished`  |Triggered when a compilation finishes.
|_method_ |`getCompilationResult` |Get the current result of the compilation.
|_method_ |`compile`              |Run solidity compiler with a file.

## Examples

### Events
`compilationFinished`: 
```typescript
client.solidity.on('compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
  // Do something
})
// OR
client.on('solidity', 'compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
  // Do something
})
```

### Methods
`getCompilationResult`:
```typescript
const result = await client.solidity.getCompilationResult()
// OR
const result = await client.call('solidity', 'getCompilationResult')
```

`compile`:
```typescript
const fileName = 'browser/ballot.sol'
await client.solidity.compile(fileName)
// OR
await client.call('solidity', 'compile', 'fileName')
```

## Types
`CompilationFileSources`: A map with the file name as the key and the content as the value.

`CompilationResult`: The result of the compilation matches the [Solidity Compiler Output documentation](https://solidity.readthedocs.io/en/latest/using-the-compiler.html#output-description).

> Type Definitions can be found [here](../src/lib/compiler/type)