# Breaking changes 
(please reach out to our gitter channel - https://gitter.im/ethereum/remix-dev - for any questions)

## 0.2.0 -> 0.3.0
- function `buildIframeClient` is now merged with `createIframeClient`.

## remix-plugin -> @remixproject
- `remix-plugin` is now divided into two packages to lower the amount of code need per package.
  - `@remixproject/plugin`: Library to build plugin and interact with the IDE.
  - `@remixproject/engine`: Library to build a plugin engine. Used by RemixIDE.
- You need to wait for your plugin to be loaded before listening to an event

## api < 0.5 -> api 0.5
- `RemixExtension` is now called `RemixClient`.
- Use `createIframeClient()` instead of `new RemixExtension()` to create a Client.
- `loaded()` is now called `onload()`, it's a Promise **and** can have a callback function.
- `setDevMode()` is deprecated, add it inside the options of `createIframeClient()` instead see [documentation](./readme.md#DevMode).


## poc -> api 0.5

 - Using the bundled `remix-api.js` is not necessary anymore because `remix-plugin` has been published to npm.
  Please install and use `require('remix-plugin')` or `unpkg`
  https://github.com/ethereum/remix-plugin#getting-started
 
 - It is necessary to wait for the iframe to be loaded and the handshake received (which ensure the `source` is setup).
 Use `await remix.loaded()` if a call has to be made just after the plugin loads (https://github.com/ethereum/remix-plugin#loaded)
 
 - The previous version wrapped parameters in an array like `remix.call('target_name', 'fn_name', ['param_1', 'param_2'])`. Now each parameters are part of the `call` function: `remix.call('target_name', 'fn_name', 'param_1', 'param_2')` (https://github.com/ethereum/remix-plugin#call)
 
 - The key/value (first and second parameter of a `call`) might have changed depending of the module. Please check the new API https://github.com/ethereum/remix-plugin#api
 
 - In order to visually fits with the parent app, plugins should use the bootstrap framework (https://getbootstrap.com/docs/4.0/utilities/borders/)
 you don't actually need to add a reference of the bootstrap css in your page, `remix-plugin` takes care of adding the right css reference and updating it when the theme changes.
 
 
