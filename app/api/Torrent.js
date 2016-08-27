/**
 * Torrents controller, responsible for playing, stoping, etc
 */
import os from 'os';
import WebTorrent from 'webtorrent';
import { isExactEpisode } from './torrents/BaseTorrentProvider';


const port = 9090;

export default class Torrent {

  inProgress = false;

  finished = false;

  start(magnetURI: string, metadata: Object, supportedFormats: Array<string>, cb) {
    if (this.inProgress) {
      throw new Error('Torrent already in progress');
    }

    const { season, episode, activeMode } = metadata;
    const maxConns = process.env.CONFIG_MAX_CONNECTIONS
                      ? parseInt(process.env.CONFIG_MAX_CONNECTIONS, 10)
                      : 20;

    this.engine = new WebTorrent({ maxConns });
    this.inProgress = true;
    this.magnetURI = magnetURI;

    const cacheLocation = (() => {
      switch (process.env.CONFIG_PERSIST_DOWNLOADS) {
        case 'true':
          return process.env.CONFIG_DOWNLOAD_LOCATION || '/tmp/popcorn-time-desktop';
        default:
          return os.tmpdir();
      }
    })();

    this.engine.add(magnetURI, { path: cacheLocation }, torrent => {
      const server = torrent.createServer();
      server.listen(port);
      this.server = server;

      const { file, torrentIndex } = torrent.files.reduce((previous, current, index) => {
        const formatIsSupported = !!supportedFormats.find(
          format => current.name.includes(format)
        );

        switch (activeMode) {
          // Check if the current file is the exact episode we're looking for
          case 'season_complete':
            if (formatIsSupported && isExactEpisode(current.name, season, episode)) {
              previous.file.deselect();
              return {
                file: current,
                torrentIndex: index
              };
            }

            return previous;

          // Check if the current file is greater than the previous file
          default:
            if (formatIsSupported && current.length > previous.file.length) {
              previous.file.deselect();
              return {
                file: current,
                torrentIndex: index
              };
            }

            return previous;
        }
      }, { file: torrent.files[0], torrentIndex: 0 });

      if (typeof torrentIndex !== 'number') {
        console.warn('File List', torrent.files.map(_file => _file.name));
        throw new Error(`No torrent could be selected. Torrent Index: ${torrentIndex}`);
      }

      const buffer = 1 * 1024 * 1024; // 1MB
      const files = torrent.files;

      file.select();

      torrent.on('done', () => {
        this.inProgress = false;
        this.clearIntervals();
      });

      this.checkDownloadInterval = setInterval(() => {
        if (torrent.downloaded > buffer) {
          console.log('Ready...');

          cb(
            `http://localhost:${port}/${torrentIndex}`,
            file,
            files,
            torrent,
            selectSubtitleFile(files, activeMode, metadata)
          );

          this.clearIntervals();
        }
      }, 1000);
    });
  }

  clearIntervals() {
    clearInterval(this.checkDownloadInterval);
  }

  destroy() {
    if (this.inProgress) {
      console.log('Destroyed Torrent...');

      if (this.server) {
        this.server.close();
        this.server = undefined;
      }

      this.clearIntervals();

      this.engine.destroy();
      this.engine = undefined;

      this.inProgress = false;
    }
  }
}

export function formatSpeeds({ downloadSpeed, uploadSpeed, progress, numPeers, ratio }) {
  return {
    downloadSpeed: downloadSpeed / 1000000,
    uploadSpeed: uploadSpeed / 1000000,
    progress: Math.round(progress * 100) / 100,
    numPeers,
    ratio
  };
}

/**
 * Get the subtitle file buffer given an array of files
 */
export function selectSubtitleFile(files: Array<string>, activeMode: string, metadata: string) {
  return files.find(file => {
    const formatIsSupported = file.name.includes('.srt');

    switch (activeMode) {
      // Check if the current file is the exact episode we're looking for
      case 'season_complete': {
        const { season, episode } = metadata;
        return (formatIsSupported && isExactEpisode(file.name, season, episode));
      }

      // Check if the current file is greater than the previous file
      default:
        return formatIsSupported;
    }
  });
}
