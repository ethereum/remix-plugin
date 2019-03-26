const path = require('path')
const merge = require('webpack-merge');
const common = require('../webpack.example');

module.exports = merge(common, {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
  },
  devServer: {
    contentBase: './dist',
    port: 8080
  },
})
