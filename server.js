/* eslint no-console: 0 */
import { exec } from 'child_process';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import Dashboard from 'webpack-dashboard';
import DashboardPlugin from 'webpack-dashboard/plugin';
import config from './webpack.config.development';

const app = express();
const compiler = webpack(config);
const dashboard = new Dashboard();
compiler.apply(new DashboardPlugin(dashboard.setData));
const PORT = process.env.PORT || 3000;

const wdm = webpackDevMiddleware(compiler, {
  quiet: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
});

app.use(wdm);

app.use(webpackHotMiddleware(compiler, {
  log: () => {}
}));

const server = app.listen(PORT, 'localhost', error => {
  if (error) {
    console.error(error);
    return;
  }

  exec('npm run start-hot', (_error, stdout, stderr) => {
    if (_error) {
      return console.error(`exec error: ${_error}`);
    }
    return [
      console.log(`stdout: ${stdout}`),
      console.log(`stderr: ${stderr}`)
    ];
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
