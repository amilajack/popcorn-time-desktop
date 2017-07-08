// @flow
import os from 'os';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import extract from 'extract-zip';


const version = process.env.PREBUILT_FFMPEG_RELEASE || '0.23.5';
const baseDir = path.join(__dirname, 'node_modules', 'electron', 'dist');

function copy(filepath: string, dest: string) {
  fs.writeFileSync(
    path.join(__dirname, dest),
    fs.readFileSync(path.join(__dirname, filepath))
  );
}

function setupCasting(): boolean {
  const tmpPath = path.join(__dirname, 'app', 'dist', '.tmp');

  mkdirp(tmpPath, err => {
    if (err) console.error(err);
    else console.log(`--> Creating "${path.join('app', 'dist', '.tmp')}" dir...`);

    copy('./app/api/players/Cast.js', './.tmp/Cast.js');
    copy('./app/api/players/Cast.js', './app/dist/.tmp/Cast.js');
  });

  return true;
}

function addEnvFileIfNotExist(): boolean {
  // Check if it exists
  try {
    fs.accessSync(path.join(__dirname, '.env'));
    console.log('--> Using existing .env file...');
    return true;
  } catch (e) {
    console.log('--> Creating ".env" file...');
    copy('.env.example', '.env');
    return true;
  }
}

function getUrl(): { platform: string, dest: string } {
  switch (os.type()) {
    case 'Darwin':
      return {
        platform: 'osx',
        dest: path.join(
          baseDir,
          'Electron.app',
          'Contents',
          'Frameworks',
          'Electron Framework.framework',
          'Libraries',
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

function setupFfmpeg() {
  const { platform, dest } = getUrl();
  const zipLocation = path.join(
    __dirname,
    'ffmpeg',
    `${version}-${platform}-${os.arch()}.zip`
  );

  console.log('--> Replacing ffmpeg...');

  extract(zipLocation, { dir: dest }, error => {
    if (error) {
      console.log(error);
    }
  });
}

setupCasting();
setupFfmpeg();
addEnvFileIfNotExist();
