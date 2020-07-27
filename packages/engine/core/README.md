# Engine Core

This is the core library used to create a new plugin engine.

| Name                                           | Latest Version       |
| -----------------------------------------------| :------------------: |
| [@remixproject/engine](.)  | [![badge](https://img.shields.io/npm/v/@remixproject/engine.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine) |

Use this library if you want to create a engine **for a new environment**.

If you want to create an engine for an existing envrionment, use the specific library. For example : 
- Engine on the web : [@remixproject/engine-web](../web)
- Engine on node : [@remixproject/engine-node](../node)
- Engine on vscode : [@remixproject/engine-vscode](../vscode)

## API

| API                         | Description                          |
| ----------------------------| :----------------------------------: |
| [Engine](./api/engine.md)   | Register plugins & redirect messages |
| [Manager](./api/manager.md) | Activate & Deactive plugins          |


## Connector

The plugin connector is the main component of `@remixproject/engine`, it defines how an external plugin can connect to the engine. Checkout the [documentation](./doc/connector).
