/**
 * Base webpack config used across other specific configs
 */

const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const dotenv = require("dotenv");
const { dependencies: externals } = require("../app/package.json");

// Get all the possible flags
const data = fs.readFileSync(".env.example", { encoding: "utf8" });
const buffer = Buffer.from(data);
const flags = Object.keys(dotenv.parse(buffer));

module.exports = {
  externals: Object.keys(externals || {}),

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /node_modules[/\\](iconv-lite)[/\\].+/,
        resolve: {
          aliasFields: ["main"],
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, "app"),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: "commonjs2",
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, "app"), "node_modules"],
  },

  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
      "DEBUG_PROD",
      "ANALYTICS",
      ...flags,
    ]),
    new webpack.NamedModulesPlugin(),
  ],
};
