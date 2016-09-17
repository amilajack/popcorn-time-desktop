/**
 * This configuration is used by tests to load dependencies that should be
 * resolved by webpack
 */
require('babel-register');


module.exports = {
  output: {
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [{
      test: /\.node$/,
      loader: 'node-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  }
};
