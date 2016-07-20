import { remote } from 'electron';
import os from 'os';
import plyr from 'plyr';
import $ from 'jquery';


export default class Player {

  currentPlayer = 'plyr';

  powerSaveBlockerId = 0;

  intervalId = 0;

  static supportedPlaybackFormats = ['mp4', 'ogg', 'mov', 'webmv'];

  static experimentalPlaybackFormats = ['mkv', 'wmv'];

  /**
   * Cleanup all traces of the player UI
   */
  destroy() {
    clearInterval(this.intervalId);

    switch (this.currentPlayer) {
      case 'plyr':
        if (document.querySelector('.plyr')) {
          if (document.querySelector('.plyr').plyr) {
            document.querySelector('.plyr').plyr.destroy();
          }
        }
        break;
      case 'WebChimera':
        if (document.querySelector('.plyr')) {
          if (document.querySelector('.plyr').plyr) {
            document.querySelector('.plyr').plyr.destroy();
          }
        }
        if (this.player) {
          this.player.close();
        }
        remote.powerSaveBlocker.stop(this.powerSaveBlockerId);
        break;
      default:
        throw new Error('No player available');
    }
  }

  /**
   * Reset they player's state
   */
  reset() {
    switch (this.currentPlayer) {
      case 'plyr':
        this.player.restart();
        break;
      case 'WebChimera':
        this.player.restart();
        break;
      default:
    }
  }

  constructSource(streamingUrl, metadata) {
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

  static isFormatSupported(filename) {
    console.log('filename: ', filename);

    const supportedMimeTypes = ['webm', 'mp4', 'ogg'];
    const supported = supportedMimeTypes
      .find(type => filename.toLowerCase().includes(type));

    return !!supported;
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

  initWebChimeraPlayer(streamingUrl, metadata = {}) {
    // HACK: Temporarily prevent linux from using WebChimera
    //       Waiting on issue 69: https://github.com/RSATom/WebChimera.js/issues/69
    if (os.type === 'Linux') {
      return false;
    }

    this.currentPlayer = 'WebChimera';

    const player = plyr.setup({
      autoplay: false,
      volume: 0,
      storage: { enabled: false },
      controls: ['play-large', 'play', 'progress', 'current-time', 'captions', 'fullscreen']
    })[0].plyr;

    player.toggleMute();

    player.source(this.constructSource(streamingUrl, metadata));

    const element = document.createElement('canvas');
    element.style.display = 'none';

    const wcjsPlayer = require('wcjs-prebuilt'); // eslint-disable-line
    const renderer = require('wcjs-renderer'); // eslint-disable-line

    const vlc = wcjsPlayer.createPlayer(['-vvv']);

    renderer.bind(element, vlc);

    const width = $('.container').width();

    document.querySelector('video').style.display = 'none';
    document.querySelector('.plyr__video-wrapper').appendChild(element);
    element.style.display = 'initial';
    $('canvas').width(width);

    vlc.play(streamingUrl);

    //
    // Event bindings
    //
    document.querySelector('.plyr').addEventListener('pause', () => vlc.pause());
    document.querySelector('.plyr').addEventListener('play', () => vlc.play());
    document.querySelector('.plyr').addEventListener('enterfullscreen',
      () => $('canvas').width($('body').width())
    );
    document.querySelector('.plyr').addEventListener('exitfullscreen',
      () => $('canvas').width(width)
    );
    document.querySelector('.plyr').addEventListener('seeking', () => {
      vlc.time = player.getCurrentTime() * 1000; // eslint-disable-line
    });
    document.querySelector('.plyr').addEventListener('mousemove', () => {
      $('canvas').css({ cursor: 'initial' });
    });

    this.intervalId = setInterval(() => {
      console.log($('canvas').is(':hover'));
      if ($('canvas').is(':hover')) {
        $('canvas').css({ cursor: 'none' });
      }
    }, 5000);

    vlc.events.on('Playing', () => {
      console.log('playing...');
      player.play();

      // Prevent display from sleeping
      if (!remote.powerSaveBlocker.isStarted(this.powerSaveBlockerId)) {
        this.powerSaveBlockerId = remote.powerSaveBlocker.start('prevent-display-sleep');
      }
    });

    vlc.events.on('Buffering', percent => {
      console.log('buffering...', percent);
      if (percent === 100) {
        player.play();
      } else {
        player.pause();
        console.log('pausing...');
      }

      // Allow the display to sleep
      remote.powerSaveBlocker.stop(this.powerSaveBlockerId);
    });

    vlc.events.on('Paused', () => {
      console.log('paused...');

      // Allow the display to sleep
      remote.powerSaveBlocker.stop(this.powerSaveBlockerId);
    });

    $(window).resize(() => {
      console.log('resizing...');
      $('canvas').width($('.container').width());
    });

    this.player = vlc;

    return player;
  }
}
