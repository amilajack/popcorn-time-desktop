/* eslint max-len: 0 */
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;

const config = {
  ...baseConfig,

  debug: true,

  devtool: 'eval',
  // devtool: 'cheap-module-eval-source-map',

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    './app/index'
  ],

  output: {
    ...baseConfig.output,
    publicPath: `http://localhost:${port}/dist/`
  },

  module: {
    ...baseConfig.module,
    loaders: [
      ...baseConfig.module.loaders,
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap',
          'postcss-loader?sourceMap',
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /\.(ttf|eot|svg|woff)/,
        loader: 'file-loader'
      }
    ]
  },

  postcss: [
    autoprefixer({ browsers: ['chrome >= 50'] })
  ],

  sassLoader: {
    includePaths: [
      './node_modules'
    ]
  },

  resolve: {
    ...baseConfig.resolve
  },

  plugins: [
    ...baseConfig.plugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.EnvironmentPlugin([
      'NODE_ENV'
    ])
  ],

  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
  ],

  target: 'electron-renderer'
};

export default config;
