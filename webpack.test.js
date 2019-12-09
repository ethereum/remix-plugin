const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path')

function config(project) {
  return {
    devtool: 'source-map',
    mode: 'development',
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
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, 'projects', project, './tsconfig.test.json')
        }),
      ],
    },
  }
}

module.exports = ['engine', 'client', 'client-ws', 'client-iframe'].map(project => config(project))
