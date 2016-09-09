import os from 'os';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { execSync } from 'child_process';
import extract from 'extract-zip';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.16.0';
const baseDir = path.normalize('./node_modules/electron-prebuilt/dist');

function setupCasting() {
  switch (os.type()) {
    case 'Windows_NT':
      mkdirp('./app/dist/.tmp', err => {
        if (err) console.error(err);
        else console.log('Created "./app/dist/.tmp" dir!');

        fs
          .createReadStream(path.normalize('./app/api/players/Cast.js'))
          .pipe(fs.createWriteStream(path.normalize('./.tmp/Cast.js')))
          .pipe(fs.createWriteStream(path.normalize('./app/dist/.tmp/Cast.js')));
      });
      return true;

    default:
      execSync([
        'mkdir -p ./app/dist/.tmp &&',
        'command cp ./app/api/players/Cast.js ./.tmp/Cast.js &&',
        'command cp ./app/api/players/Cast.js ./app/dist/.tmp/Cast.js'
      ].join(' '));

      execSync([
        'cp ./node_modules/castv2-webpack/lib/*.proto ./app/dist/.tmp/ &&',
        'cp ./node_modules/castv2-webpack/lib/*.proto ./.tmp/'
      ].join(' '));
      return true;
  }
}

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

setupCasting();
