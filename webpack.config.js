const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

function config(project) {
  return {
    mode: 'production',
    entry: `./projects/${project}`,
    module: {
      rules: [
        {
          test: /\.ts?$/,
          exclude: [/node_modules/],
          loader: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, './tsconfig.json') }),
      ],
    },
  }
}

// ENGINE
// node target for engine
const nodeEngine = {
  ...config('engine'),
  output: {
    path: path.resolve(__dirname, 'projects/engine/dist'),
    filename: 'index.node.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

// web target for engine
const webEngine = {
  ...config('engine'),
  output: {
    path: path.resolve(__dirname, 'projects/engine/dist'),
    filename: 'index.js',
    library: 'pluginEngine',
    libraryTarget: 'umd',
  },
  target: 'web'
}

// Web Engine
const engineWebConnectors = {
  ...config('engine-web'),
  externals: {
    '@remixproject/engine': 'commonjs2 @remixproject/engine',
  },
  output: {
    path: path.resolve(__dirname, 'projects/engine-web/dist'),
    filename: 'index.js',
    library: 'pluginEngineWeb',
    libraryTarget: 'umd',
  },
}

// Server Engine
const engineNodeConnectors = {
  ...config('engine-node'),
  externals: {
    '@remixproject/engine': 'commonjs2 @remixproject/engine',
  },
  output: {
    path: path.resolve(__dirname, 'projects/engine-node/dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

// Server Engine
const engineVscodeConnectors = {
  ...config('engine-vscode'),
  externals: {
    '@remixproject/engine': 'commonjs2 @remixproject/engine',
    'vscode': 'commonjs2 vscode'
  },
  output: {
    path: path.resolve(__dirname, 'projects/engine-vscode/dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

const engines = [nodeEngine, webEngine, engineWebConnectors, engineNodeConnectors, engineVscodeConnectors]


// CLIENT
const webClient = {
  ...config('client'),
  output: {
    path: path.resolve(__dirname, 'projects/client/dist'),
    filename: 'index.js',
    library: 'remixPlugin',
    libraryTarget: 'umd',
  },
  target: 'web'
}
const nodeClient = {
  ...config('client'),
  output: {
    path: path.resolve(__dirname, 'projects/client/dist'),
    filename: 'index.node.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

// Websocket client
const wsClient = {
  ...config('client-ws'),
  output: {
    path: path.resolve(__dirname, 'projects/client-ws/dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

// Iframe client
const iframeClient = {
  ...config('client-iframe'),
  output: {
    path: path.resolve(__dirname, 'projects/client-iframe/dist'),
    filename: 'index.js',
    library: 'iframePlugin',
    libraryTarget: 'umd',
  }
}

// Child Process client
const childProcessClient = {
  ...config('client-child-process'),
  output: {
    path: path.resolve(__dirname, 'projects/client-child-process/dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

const clients = [webClient, nodeClient, wsClient, iframeClient, childProcessClient]

module.exports = [...engines, ...clients]
