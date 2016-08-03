import plyr from 'plyr';
import childProcess from 'child_process';
import vlcCommand from 'vlc-command';


export default class Player {

  currentPlayer = 'plyr';

  powerSaveBlockerId = 0;

  intervalId = 0;

  static nativePlaybackFormats = ['mp4', 'ogg', 'mov', 'webmv', 'mkv', 'wmv', 'avi'];

  static experimentalPlaybackFormats = [];

  /**
   * Cleanup all traces of the player UI
   */
  destroy() {
    clearInterval(this.intervalId);

    if (document.querySelector('.plyr')) {
      if (document.querySelector('.plyr').plyr) {
        document.querySelector('.plyr').plyr.destroy();
      }
    }
  }

  /**
   * Reset they player's state
   */
  reset() {
    clearInterval(this.intervalId);
    this.player.restart();
  }

  constructSource(streamingUrl, metadata) {
    clearInterval(this.intervalId);

    const defaultSource = {
      type: 'video',
      sources: [{
        src: streamingUrl,
        type: 'video/mp4'
      }]
    };

    return 'title' in metadata
      ? { ...defaultSource, title: metadata.title }
      : defaultSource;
  }

  static isFormatSupported(filename, mimeTypes) {
    return mimeTypes.find(
      mimeType => filename.toLowerCase().includes(mimeType)
    );
  }

  initPlyr(streamingUrl, metadata = {}) {
    this.currentPlayer = 'plyr';

    const player = plyr.setup({
      autoplay: true,
      storage: { enabled: false },
      volume: 10
    })[0].plyr;

    player.source(this.constructSource(streamingUrl, metadata));

    return player;
  }

  initVLC(servingUrl) {
    vlcCommand((error, cmd) => {
      if (error) return console.error('Could not find vlc command path');

      if (process.platform === 'win32') {
        childProcess.execFile(cmd, [servingUrl], (_error, stdout) => {
          if (_error) return console.error(_error);
          console.log(stdout);
        });
      } else {
        childProcess.exec(`${cmd} ${servingUrl}`, (_error, stdout) => {
          if (_error) return console.error(_error);
          console.log(stdout);
        });
      }
    });
  }
}
