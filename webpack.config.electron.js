import webpack from 'webpack';
import baseConfig, { stats } from './webpack.config.base';


export default {
  ...baseConfig,

  devtool: 'source-map',

  entry: './main.development',

  output: {
    ...baseConfig.output,
    path: __dirname,
    filename: './app/main.js'
  },

  stats,

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.EnvironmentPlugin([
      'NODE_ENV'
    ])
  ],

  target: 'electron-main',

  node: {
    __dirname: false,
    __filename: false
  },

  externals: [
    ...baseConfig.externals,
    'source-map-support'
  ]
};
