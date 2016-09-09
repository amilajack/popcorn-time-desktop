import os from 'os';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import extract from 'extract-zip';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.16.0';
const baseDir = path.normalize('./node_modules/electron-prebuilt/dist');

function setupCasting(): boolean {
  mkdirp('./app/dist/.tmp', err => {
    if (err) console.error(err);
    else console.log('--> Creating "./app/dist/.tmp" dir...');

    _copy('./app/api/players/Cast.js', './.tmp/Cast.js');
    _copy('./app/api/players/Cast.js', './app/dist/.tmp/Cast.js');
  });

  return true;
}

function addEnvFile(): boolean {
  // Check if it exists
  try {
    fs.accessSync(path.join(__dirname, '.env'));
    console.log('--> Using existing .env file...');
    return true;
  } catch (e) {
    console.log('--> Creating ".env" file...');
    _copy('.env.example', '.env');
    return true;
  }
}

function setupFFMPEG() {
  const { platform, dest } = _getUrl();
  const zipLocation = `./ffmpeg/${version}-${platform}-${os.arch()}.zip`;

  console.log('--> Replacing ffmpeg...');

  extract(zipLocation, { dir: dest }, error => {
    if (error) {
      console.log(error);
    }
  });
}

function _getUrl(): Object {
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

function _copy(filepath: string, dest: string): boolean {
  try {
    fs.accessSync(path.join(__dirname, filepath));
    return true;
  } catch (e) {
    fs.writeFileSync(
      path.join(__dirname, dest),
      fs.readFileSync(path.join(__dirname, filepath))
    );

    return true;
  }
}

setupCasting();
setupFFMPEG();
addEnvFile();
