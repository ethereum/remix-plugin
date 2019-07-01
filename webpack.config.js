const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const common = {
  mode: 'production',
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

// ENGINE
const engine = {
  ...common,
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
  entry: './projects/client',
  output: {
    path: path.resolve(__dirname, 'projects/client/dist'),
    filename: 'index.js',
    library: 'remixPlugin',
    libraryTarget: 'umd',
  }
}


module.exports = [engine, client]
