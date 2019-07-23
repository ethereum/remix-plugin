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


module.exports = [engine, client]
