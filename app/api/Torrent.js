/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */
import WebTorrent from 'webtorrent';
import { isExactEpisode } from './torrents/BaseTorrentProvider';


const port = 9090;

export default class Torrent {

  inProgress = false;

  finished = false;

  /**
   * @todo: Refactor butter api calls to Movie component. Butter, Player, and
   *        Torrent should work independently of each other
   */
  start(magnetURI, metadata, supportedFormats, cb) {
    if (this.inProgress) {
      throw new Error('Torrent already in progress');
    }

    const { season, episode, activeMode } = metadata;
    const maxConns = process.env.CONFIG_MAX_CONNECTIONS
                      ? parseInt(process.env.CONFIG_MAX_CONNECTIONS, 10)
                      : 100;

    this.engine = new WebTorrent({ maxConns });
    this.inProgress = true;

    console.warn(`Using '${activeMode}' method`);
    const cacheLocation = process.env.CONFIG_CACHE_LOCATION || '/tmp/popcorn-time-desktop';

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

      const files = torrent.files;
      const { name } = file;
      file.select();

      const buffer = 5 * 1024 * 1024; // 5MB

      torrent.on('done', () => {
        this.inProgress = false;
        this.clearIntervals();
      });

      this.checkDownloadInterval = setInterval(() => {
        if (torrent.downloaded > buffer) {
          console.log('Ready...');

          cb(
            `http://localhost:${port}/${torrentIndex}`,
            name,
            files,
            torrent
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
