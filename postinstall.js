import os from 'os';
import path from 'path';
import extract from 'extract-zip';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.16.0';

let platform;
let dest;
const baseDir = path.normalize('./node_modules/electron-prebuilt/dist');

switch (os.type()) {
  case 'Darwin':
    platform = 'osx';
    dest = path.join(
      baseDir,
      '/Electron.app/Contents/Frameworks/Electron Framework.framework/Libraries',
    );
    break;
  case 'Windows_NT':
    platform = 'win';
    dest = baseDir;
    break;
  case 'Linux':
    platform = 'linux';
    dest = baseDir;
    break;
  default:
    platform = 'linux';
    dest = baseDir;
}

const zipLocation = `./ffmpeg/${version}-${platform}-${os.arch()}.zip`;

extract(zipLocation, { dir: dest }, error => {
  if (error) {
    console.log(error);
  }
});
