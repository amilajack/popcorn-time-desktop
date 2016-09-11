import { remote } from 'electron';
import plyr from 'plyr';
import childProcess from 'child_process';
import vlcCommand from 'vlc-command';


const { powerSaveBlocker } = remote;

export default class Player {

  currentPlayer = 'plyr';

  static nativePlaybackFormats = ['mp4', 'ogg', 'mov', 'webmv', 'mkv', 'wmv', 'avi'];

  static experimentalPlaybackFormats = [];

  /**
   * Cleanup all traces of the player UI
   */
  destroy() {
    if (this.powerSaveBlockerId) {
      powerSaveBlocker.stop(this.powerSaveBlockerId);
    }
  }

  /**
   * restart they player's state
   */
  restart() {
    this.player.restart();
  }

  static isFormatSupported(filename, mimeTypes) {
    return mimeTypes.find(
      mimeType => filename.toLowerCase().includes(mimeType)
    );
  }

  initPlyr(streamingUrl, metadata = {}) {
    this.currentPlayer = 'plyr';
    this.powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');

    this._player = this._player || plyr.setup({
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

  initVLC(servingUrl) {
    vlcCommand((error, cmd) => {
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
