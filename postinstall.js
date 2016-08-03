import os from 'os';
import fs from 'fs';
import path from 'path';
import download from 'download';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.16.0';

let platform;
let extension;
let filename;
let dest;
const baseDir = './node_modules/electron-prebuilt/dist';

switch (os.type()) {
  case 'Darwin':
    platform = 'osx';
    filename = 'libffmpeg';
    extension = 'dylib';
    dest = path.join(
      baseDir,
      '/Electron.app/Contents/Frameworks/Electron Framework.framework/Libraries',
      // `${filename}.${extension}`
    );
    break;
  case 'Windows_NT':
    platform = 'win';
    filename = 'ffmpeg';
    extension = 'dll';
    dest = path.join(
      baseDir, ''
    );
    break;
  case 'Linux':
    platform = 'linux';
    filename = 'libffmpeg';
    extension = 'so';
    dest = path.join(
      baseDir, ''
    );
    break;
  default:
    platform = 'linux';
    filename = 'libffmpeg';
    extension = 'so';
    dest = path.join(
      baseDir, ''
    );
}

const ffmpegDownloadUrl =
  'https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/' +
  `${version}/` +
  `${version}-${platform}-${os.arch()}.zip`;

const zipLocation = `./ffmpeg/${version}-${platform}-${os.arch()}.zip`;


console.log(dest);

var extract = require('extract-zip')
extract(zipLocation, {dir: dest}, function (err) {
 // extraction is complete. make sure to handle the err
})

// console.log('Deleting ffmpeg...');

// fs.unlink(dest, error => {
//   console.log(error);
// });

// console.log('Downloading ffmpeg...');

// download(ffmpegDownloadUrl, dest, {
//   extract: true
// })
//   .then(() => {
//     console.log('Replacing ffmpeg...');
//   })
//   .catch(error => console.log(error));
