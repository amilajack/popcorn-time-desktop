require('babel-register');

const electron = require('./webpack.config.main');
const production = require('./webpack.config.renderer');

const jobs = [electron, production];

module.exports = jobs;
