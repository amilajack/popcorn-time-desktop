require('babel-register');

const electron = require('./webpack.config.electron');
const production = require('./webpack.config.production');

const jobs = [electron, production];

module.exports = jobs;
