# Engine

The Engine is implemented by IDE or applications that want to take advantage of the plugins developed for the Remix IDE.

## Install
```bash
npm install @remixproject/engine@next
```

## Tutorial

1. [Getting Started](1-getting-started.md)
2. [Plugin Communication](2-plugin-communication.md)
3. [Host a Plugin with UI](3-hosted-plugin.md)
4. [External Plugins](4-external-plugins.md)
5. [Plugin Service](5-plugin-service.md)


## Plugins to implement for an IDE

If you want to build an Ethereum IDE around this Engine you need to implement those plugins :

### Low Level
- File System
- Editor
- Compiler (1-n)
- Wallet (1-n)
- Provider (1-n)

### High Level
- Contract

------

Note: The current API implemented by Remix IDE is:
- solidity -> Compiler
- fileManager -> FileSystem
- editor
- network -> Provider Manager
- udapp -> Provider

Remix IDE will evolve to match the spec above.