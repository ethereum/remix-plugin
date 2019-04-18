# Solidity Compiler

- Name: `solidity`
- kind: `compiler`

Remix exposes the `solidity` compiler.

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`compilationFinished`  |Triggered when a compilation finishes.
|_method_ |`getCompilationResult` |Get the current result of the compilation.

## Examples

### Events
`compilationFinished`: 
```typescript
client.solidity.on('compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
  // Do something
})
// OR
client.listen('solidity', 'compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
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

## Types
`CompilationFileSources`: A map with the files name as key and the content as value.

`CompilationResult`: The result of the compilation matches the [Solidity Compiler Output documentation](https://solidity.readthedocs.io/en/latest/using-the-compiler.html#output-description).

> Type Definitions can be found [here](../../src/api/compiler/type.ts)