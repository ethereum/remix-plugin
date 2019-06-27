const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const common = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
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

module.exports = [{
  ...common,
  entry: './projects/engine/index.ts',
  output: {
    path: path.resolve(__dirname, 'projects/engine/dist'),
    filename: 'index.js',
    library: 'pluginEngine',
    libraryTarget: 'umd',
  },
}, {
  ...common,
  entry: './projects/client/index.ts',
  output: {
    path: path.resolve(__dirname, 'projects/client/dist'),
    filename: 'index.js',
    library: 'remixPlugin',
    libraryTarget: 'umd',
  },
}]
