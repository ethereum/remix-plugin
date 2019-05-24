const path = require('path')
const merge = require('webpack-merge');
const common = require('../../webpack.example');

module.exports = merge(common, {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
  },
})