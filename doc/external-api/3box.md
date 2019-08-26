# 3Box
3Box is a plugin that exposed some methods of the [3box API](https://docs.3box.io/) :
- [ ] Profile
- [X] Space : **Creates one space per plugin**
- [ ] Thread

- Name in Remix: `box`


|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`enabled`              |Provider has enable 3box plugin
|_event_  |`loggedIn`             |User is now loggedIn to 3box
|_event_  |`loggedOut`            |User has logged out of 3box
|_event_  |`spaceOpened`          |A space has been opened
|_event_  |`spaceClosed`          |A space has been closed
|_method_ |`login`                |Login to 3box
|_method_ |`getUserAddress`       |Get address of current user (Used to check if user is loggedIn)
|_method_ |`isEnabled`            |Is 3box plugin yet enabled
|_method_ |`isSpaceOpened`        |Is the space of the plugin using 3box opened
|_method_ |`openSpace`            |Open a space for the plugin using 3box, based on its name
|_method_ |`closeSpace`           |Close the space for the plugin using 3box
|_method_ |`getSpaceName`         |Get the space name of the current plugin using 3box
|_method_ |`getSpacePrivateValue` |Get the content of a key from the **private** space
|_method_ |`setSpacePrivateValue` |Set the content of a key of the **private** space
|_method_ |`getSpacePublicValue`  |Get the content of a key from the **public** space
|_method_ |`setSpacePublicValue`  |Set the content of a key of the **public** space
|_method_ |`getSpacePublicData`   |Get the content of a key of the **public** space of another address

## Examples

### Events

#### enabled 
Provider has enable 3box plugin
```typescript
client.box.on('enabled', () => console.log('3Box plugin is enabled'))
```

#### loggedIn
User is now loggedIn to 3box
```typescript
client.box.on('loggedIn', () => console.log('User is loggedIn'))
```

#### loggedOut
User has logged out of 3box
```typescript
client.box.on('loggedOut', () => console.log('User has logged out'))
```

#### spaceOpened 
A space has been opened
```typescript
client.box.on('spaceOpened', (name: string) => console.log(`Space ${name} is now open`))
```

#### spaceClosed 
A space has been closed
```typescript
client.box.on('spaceClosed', (name: string) => console.log(`Space ${name} is now closed`))
```

### Methods
#### login
Login to 3box
```typescript
await client.box.login()
```

#### getUserAddress
Get address of current user (Used to check if user is loggedIn)
```typescript
const address = await client.box.getUserAddress()
const isLoggedIn = !!address
```

#### isEnabled
Is 3box plugin yet enabled
```typescript
const isEnabled = await client.box.isEnabled()
```

#### isSpaceOpened
Is the space of the plugin using 3box opened
```typescript
const isMySpaceOpened = await client.box.isSpaceOpened()
```

#### openSpace
Open a space for the plugin using 3box, based on its name
```typescript
await client.box.openSpace()
```

#### closeSpace
Close the space for the plugin using 3box
```typescript
await client.box.closeSpace()
```

#### getSpaceName
Get the space name of the current plugin using 3box
```typescript
const name = await client.box.getSpaceName() // eg: "remix-fileManager"
```

#### getSpacePrivateValue
Get the content of a key from the **private** space
```typescript
const data = await client.box.getSpacePrivateValue('files')
const files = JSON.parse(data || '[]')
```

#### setSpacePrivateValue
Set the content of a key of the **private** space
```typescript
const data = JSON.stringify(['browser/ballot.sol'])
await client.box.setSpacePrivateValue('files', data)
```

#### getSpacePublicValue
Get the content of a key from the **public** space
```typescript
const data = await client.box.getSpacePublicValue('files')
const files = JSON.parse(data || '[]')
```

#### setSpacePublicValue
Set the content of a key of the **public** space
```typescript
const data = JSON.stringify(['browser/ballot.sol'])
await client.box.setSpacePublicValue('files', data)
```

#### getSpacePublicData
Get the content of a key of the **public** space of another address
```typescript
const zeroAddress = '0x00000000000000000000000000000000000000000'
 // Look in space of current plugin (eg: remix-fileManager)
const fileManagerSpace = await client.box.getSpacePublicData(zeroAddress)
const files = JSON.parse(fileManagerSpace.files || '[]')
// Look into another space
const workshopSpace = client.box.getSpacePublicData(zeroAddress, 'remix-workshops')
const workshops = JSON.parse(workshopSpace.workshops || '[]')
```