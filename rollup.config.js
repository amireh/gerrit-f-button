/* eslint env: "node" */

var path = require('path');
var fs = require('fs');
var pkg  = require('./package.json');
var json = require('rollup-plugin-json');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  dest: path.resolve(__dirname, 'gerrit-f-button.js'),
  format: 'iife',
  sourceMap: process.env.NODE_ENV === 'production' ? null : 'inline',

  banner: (
    fs.readFileSync(path.resolve(__dirname, 'src/banner.txt')) +
    '\n/* gerrit-f-button.js v' + pkg.version + ' */\n'
  ),

  plugins: [
    json()
  ]
};