import path from 'path';
import fs from 'fs';

export default {
  entry: path.resolve(__dirname, 'src/index.js'),
  dest: path.resolve(__dirname, 'gerrit-f-button.js'),
  format: 'iife',
  sourceMap: 'inline',

  banner: fs.readFileSync(path.resolve(__dirname, 'src/banner.txt'))
}