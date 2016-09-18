import path from 'path';
import webpack from 'webpack';
import HappyPack from 'happypack';


export const stats = {
  colors: true,
  hash: false,
  version: false,
  timings: false,
  assets: false,
  chunks: false,
  modules: false,
  reasons: false,
  children: false,
  source: false,
  errors: true,
  errorDetails: false,
  warnings: false,
  publicPath: false
};

export default {
  cache: true,

  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'happypack/loader?id=babel',
      exclude: /node_modules/
    }, {
      test: /\.node$/,
      loader: 'happypack/loader?id=node'
    }, {
      test: /\.json$/,
      loader: 'happypack/loader?id=json'
    }]
  },
  output: {
    path: path.join(__dirname, './app/dist'),
    filename: 'renderer.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    alias: {
      castv2: 'castv2-webpack'
    }
  },
  plugins: [
    new webpack.IgnorePlugin(/^(README.md)$/),
    new HappyPack({
      id: 'babel',
      threads: 4,
      loaders: ['babel-loader']
    }),
    new HappyPack({
      id: 'node',
      threads: 4,
      loaders: ['node-loader']
    }),
    new HappyPack({
      id: 'json',
      threads: 4,
      loaders: ['json-loader']
    })
  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
  ]
};
