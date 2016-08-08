import os from 'os';
import path from 'path';
import extract from 'extract-zip';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.16.0';

const baseDir = path.normalize('./node_modules/electron-prebuilt/dist');

function getUrl() {
  switch (os.type()) {
    case 'Darwin':
      return {
        platform: 'osx',
        dest: path.join(
          baseDir,
          '/Electron.app/Contents/Frameworks/Electron Framework.framework/Libraries',
        )
      };
    case 'Windows_NT':
      return {
        platform: 'win',
        dest: baseDir
      };
    case 'Linux':
      return {
        platform: 'linux',
        dest: baseDir
      };
    default:
      return {
        platform: 'linux',
        dest: baseDir
      };
  }
}

const { platform, dest } = getUrl();
const zipLocation = `./ffmpeg/${version}-${platform}-${os.arch()}.zip`;

console.log('Replacing ffmpeg...');

extract(zipLocation, { dir: dest }, error => {
  if (error) {
    console.log(error);
  }
});
