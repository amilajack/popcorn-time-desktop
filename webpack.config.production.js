import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import baseConfig from './webpack.config.base';
import fs from 'fs';
import dotenv from 'dotenv';


// Get all the possible flags
const data = fs.readFileSync('.env.example', { encoding: 'utf8' });
const buffer = new Buffer(data);
const flags = Object.keys(dotenv.parse(buffer));

const config = {
  ...baseConfig,

  devtool: 'cheap-module-source-map',

  entry: './app/index',

  output: {
    ...baseConfig.output,

    publicPath: './app/dist'
  },

  module: {
    ...baseConfig.module,

    loaders: [
      ...baseConfig.module.loaders,

      {
        test: /\.global\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader'
        )
      },

      {
        test: /^((?!\.global).)*\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
        )
      }
    ]
  },

  plugins: [
    ...baseConfig.plugins,
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      ...flags
    ]),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new ExtractTextPlugin('main.css', { allChunks: true })
  ],

  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
    'wcjs-renderer', 'wcjs-prebuilt'
  ],

  target: 'electron-renderer'
};

export default config;
