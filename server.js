/* eslint no-console: 0 */

import { exec } from 'child_process';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from './webpack.config.development';
import { stats } from './webpack.config.base.js';

const app = express();
const compiler = webpack(config);
const PORT = 3000;

const wdm = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats
});

app.use(wdm);

app.use(webpackHotMiddleware(compiler));

const server = app.listen(PORT, 'localhost', error => {
  if (error) {
    return console.error(error);
  }

  exec('npm run start-hot', (_error, stdout, stderr) => {
    if (_error) {
      return console.error(`exec error: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });

  console.log(`Listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server');
  wdm.close();
  server.close(() => {
    process.exit(0);
  });
});
