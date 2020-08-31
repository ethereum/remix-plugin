# File System

- Name in Remix: `fileManager`
- kind: `fs`


|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`currentFileChanged`   |Triggered when a file changes.
|_method_ |`getFolder`            |Get a `Folder` map (see below) from a path.
|_method_ |`getCurrentFile`       |Get the name of the current file selected.
|_method_ |`getFile`              |Get the content of a file.
|_method_ |`setFile`              |Set the content of a file.
|_method_ |`switchFile`           |Switch the current File to the new one

## Examples

### Events
`currentFileChanged`: Triggered when a file changes.
```typescript
client.solidity.on('currentFileChanged', (fileName: string) => {
  // Do something
})
// OR
client.on('fileManager', 'currentFileChanged', (fileName: string) => {
  // Do something
})
```

### Methods
`getFolder`: Get a list of names from a path.
```typescript
const folder = await client.fileManager.getFolder('/browser')
// OR
const folder = await client.call('fileManager', 'getFolder', '/browser')
```

`getCurrentFile`: Get the name of the current file selected.
```typescript
const fileName = await client.fileManager.getCurrentFile()
// OR
const fileName = await client.call('fileManager', 'getCurrentFile')
```

`getFile`: Get the content of a file.
```typescript
const ballot = await client.fileManager.getFile('browser/ballot.sol')
// OR
const fileName = await client.call('fileManager', 'getFile', 'browser/ballot.sol')
```

`setFile`: Set the content of a file.
```typescript
await client.fileManager.setFile('browser/ballot.sol', 'pragma ....')
// OR
await client.call('fileManager', 'setFile', 'browser/ballot.sol', 'pragma ....')
```

`switchFile`: Switch the current File to the new one.
```typescript
await client.fileManager.switchFile('browser/ballot.sol')
// OR
await client.call('fileManager', 'switchFile', 'browser/ballot.sol')
```

## Types
`Folder`: A map with the file name as the key and the metadata of this file as value.

> Type Definitions can be found [here](../src/lib/file-system/type.ts)