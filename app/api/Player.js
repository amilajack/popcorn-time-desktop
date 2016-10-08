// @flow
import { remote } from 'electron';
import plyr from 'plyr';
import childProcess from 'child_process';
import vlcCommand from 'vlc-command';


const { powerSaveBlocker } = remote;

export default class Player {

  currentPlayer = 'plyr';

  powerSaveBlockerId: number;

  _player: plyr;

  static nativePlaybackFormats = ['mp4', 'ogg', 'mov', 'webmv', 'mkv', 'wmv', 'avi'];

  static experimentalPlaybackFormats = [];

  /**
   * Cleanup all traces of the player UI
   */
  destroy() {
    if (this.powerSaveBlockerId) {
      powerSaveBlocker.stop(this.powerSaveBlockerId);
    }
    if (this._player) {
      this._player.destroy();
    }
  }

  /**
   * restart they player's state
   */
  restart() {
    this._player.restart();
  }

  static isFormatSupported(filename: string, mimeTypes: Array<string>): boolean {
    return !!mimeTypes.find(
      mimeType => filename.toLowerCase().includes(mimeType)
    );
  }

  initPlyr(streamingUrl: string, metadata: Object = {}): plyr {
    console.info('Initializing plyr...');
    this.currentPlayer = 'plyr';
    this.powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');

    this._player = plyr.setup({
      volume: 10,
      autoplay: true,
      showPosterOnEnd: true
    })[0];

    const player = this._player;

    player.source({
      type: 'video',
      sources: [{
        src: streamingUrl,
        type: 'video/mp4'
      }],
      ...metadata
    });

    player.poster(metadata.poster);

    return player;
  }

  initVLC(servingUrl: string) {
    vlcCommand((error, cmd: string) => {
      if (error) return console.error('Could not find vlc command path');

      if (process.platform === 'win32') {
        childProcess.execFile(cmd, [servingUrl], (_error, stdout) => {
          if (_error) return console.error(_error);
          return console.log(stdout);
        });
      } else {
        childProcess.exec(`${cmd} ${servingUrl}`, (_error, stdout) => {
          if (_error) return console.error(_error);
          return console.log(stdout);
        });
      }

      this.powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');

      return true;
    });
  }
}
