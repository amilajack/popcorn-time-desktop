/**
 * Webpack config for production electron main process
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import baseConfig from './webpack.config.base';

if (process.env.NODE_ENV !== 'production') {
  throw new Error('Production builds must have NODE_ENV=production');
}

export default merge.smart(baseConfig, {
  devtool: 'source-map',

  target: 'electron-main',

  mode: 'production',

  entry: './app/main.dev',

  output: {
    path: __dirname,
    filename: './app/main.prod.js'
  },

  plugins: [
    new LodashModuleReplacementPlugin(),

    new UglifyJSPlugin({
      parallel: true,
      sourceMap: true,
      cache: true
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: 'false'
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
});
