# Remix Plugin

Remix plugin is a universal plugin system written in Typescript.

It provides an extendable engine that simplifies communication between multiple internal or external sources.


This repository manages multiple projects related to remix plugins. It's divided into two main categories : 
- Engine: A library to manage communication between plugins. 
- Plugin: A library to create an external plugin.

## Engine

The core component of the engine is the `@remixproject/engine` library. It can be extended to run in different environments.

| Name                                                                     | Latest Version       | Next Version
| ------------------------------------------------------------------------ | :------------------: | :------------------:
| [@remixproject/engine](/packages/engine/core)                            | [![badge](https://img.shields.io/npm/v/@remixproject/engine/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine) | [![badge](https://img.shields.io/npm/v/@remixproject/engine/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine)
| [@remixproject/engine-vscode](/packages/engine/vscode)                   | [![badge](https://img.shields.io/npm/v/@remixproject/engine-vscode/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-vscode) | [![badge](https://img.shields.io/npm/v/@remixproject/engine-vscode/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-vscode)
| [@remixproject/engine-web](/packages/engine/web)                         | [![badge](https://img.shields.io/npm/v/@remixproject/engine-web/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-web) | [![badge](https://img.shields.io/npm/v/@remixproject/engine-web/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-web)
| [@remixproject/engine-node](/packages/engine/node)                       | [![badge](https://img.shields.io/npm/v/@remixproject/engine-node/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-node) | [![badge](https://img.shields.io/npm/v/@remixproject/engine-node/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/engine-node)

> To create a new environment connector, check out [@remixproject/engine](/packages/engine/core). 


## Plugin

The core component of the plugin is the `@remixproject/plugin` library. It can be extended to run in different environments.

| Name                                                                     | Latest Version       | Next Version
| ------------------------------------------------------------------------ | :------------------: | :------------------:
| [@remixproject/plugin](/packages/plugin/core)                            | [![badge](https://img.shields.io/npm/v/@remixproject/plugin/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin)
| [@remixproject/plugin-vscode](/packages/plugin/vscode)                   | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-vscode/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-vscode) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-vscode/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-vscode)
| [@remixproject/plugin-iframe](/packages/plugin/iframe)                         | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-iframe/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-iframe) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-iframe/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-iframe)
| [@remixproject/plugin-webview](/packages/plugin/webview)                         | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-webview/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-webview) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-webview/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-webview)
| [@remixproject/plugin-child-process](/packages/plugin/child-process)                       | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-child-process/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-child-process) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-child-process/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-child-process)

> To create a new environment connector, check out [@remixproject/plugin](/packages/plugin/core). 


## API

Remix plugin offers a set of common APIs for plugins to implement. This set of APIs is used in [remix-ide](https://remix.ethereum.org), therefore every plugin running inside remix-ide should be able to run in an engine that implements these APIs.

| Name                               | Latest Version       | Next Version
| ---------------------------------- | :------------------: | :------------------:
| [@remixproject/plugin-api](/packages/api) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-api/latest.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-api) | [![badge](https://img.shields.io/npm/v/@remixproject/plugin-api/next.svg?style=flat-square)](https://www.npmjs.com/package/@remixproject/plugin-api)



> The first goal of **remix plugin** is to enable a plugin to work in the envrionments of multiple engines. If a plugin has dependancies on other plugins, each engine must implement these dependancies.


# Contribute

## Setup
```
git clone https://github.com/ethereum/remix-plugin.git
cd remix-plugin
npm install
```

## See dependancy graph
To better understand the project structure, you can display a dependancy graph with:
```
npm run dep-graph
```
Open your browser on `http://localhost:4211/`.


## Build
This uses nx's affected:build to only update what has been changes since last build.
```
npm run build
```

## Build a specific project
```
npx nx build ${projectName} --with-deps
```

**Example for engine-vscode :**
```
npx nx build engine-vscode --with-deps
```

## Test
This uses nx's affected:test to only update what has been changes since last test.
```
npm test
```

## Publish
This uses lerna to deploy all the packages with a new version:
```
npm run deploy:latest
```
OR
```
npm run deploy:next
```