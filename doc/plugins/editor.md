# Editor

- Name in Remix: `editor`
- kind: `editor`

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_method_ |`highlight`            |Highlight a piece of code in the editor.
|_method_ |`discardHighlight`     |Remove the highlight triggered by this plugin.

## Examples

### Methods
`highlight`: Highlight a piece of code in the editor.
```typescript
const position = {                  // Range of code to highlight
  start: { line: 1, column: 1 },
  end: { line: 1, column: 42 }
}
const file = 'browser/ballot.sol'   // File to highlight
const color = '#e6e6e6'             // Color of the highlight

await client.call('editor', position, file, color)
// OR
await client.editor.highlight(position, file, color)
```

`discardHighlight`: Remove the highlight triggered by this plugin.
```typescript
await client.call('editor', 'discardHighlight')
// OR 
await client.editor('discardHighlight')
```


## Types
`HighlightPosition`: The positions where the highlight starts and ends.
```typescript
interface HighlightPosition {
  start: {
    line: number
    column: number
  }
  end: {
    line: number
    column: number
  }
}
```

> Type Definitions can be found [here](../../src/api/editor/type.ts)