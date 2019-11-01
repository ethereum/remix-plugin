const path = require('path')
const common = require('./webpack.common')

// ENGINE
const engine = {
  ...common,
  mode: 'production',
  entry: './projects/engine',

  output: {
    path: path.resolve(__dirname, 'projects/engine/dist'),
    filename: 'index.js',
    library: 'pluginEngine',
    libraryTarget: 'umd',
  },
}

// CLIENT
const client = {
  ...common,
  mode: 'production',
  entry: './projects/client',
  output: {
    path: path.resolve(__dirname, 'projects/client/dist'),
    filename: 'index.js',
    library: 'remixPlugin',
    libraryTarget: 'umd',
  }
}

// Websocket client
const wsClient = {
  ...common,
  mode: 'production',
  entry: './projects/client-ws',
  output: {
    path: path.resolve(__dirname, 'projects/client-ws/dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  target: 'node'
}

// Websocket client
const iframeClient = {
  ...common,
  mode: 'production',
  entry: './projects/client-iframe',
  output: {
    path: path.resolve(__dirname, 'projects/client-iframe/dist'),
    filename: 'index.js',
    library: 'iframePlugin',
    libraryTarget: 'umd',
  }
}

module.exports = [engine, client, wsClient, iframeClient]
