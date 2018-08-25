/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const dotenv = require('dotenv');
const { dependencies: externals } = require('./app/package.json');

// Get all the possible flags
const data = fs.readFileSync('.env.example', { encoding: 'utf8' });
const buffer = Buffer.from(data);
const flags = Object.keys(dotenv.parse(buffer));

module.exports = {
  externals: Object.keys(externals || {}),

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.join(__dirname, 'app'), 'node_modules']
  },

  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV', 'DEBUG_PROD', ...flags]),
    new webpack.NamedModulesPlugin()
  ]
};
