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
                      : 20;

    this.engine = new WebTorrent({ maxConns });
    this.inProgress = true;

    console.warn(`Using '${activeMode}' method`);
    const cacheLocation = process.env.CONFIG_CACHE_LOCATION || '/tmp/popcorn-time-desktop';

    this.engine.add(magnetURI, { path: cacheLocation }, torrent => {
      const server = torrent.createServer();
      server.listen(port);
      this.server = server;

      let [file] = torrent.files;
      let torrentIndex = 0;

      for (let i = 0; i < torrent.files.length; i++) {
        const isSupported = !!supportedFormats.find(
          format => torrent.files[i].name.includes(format)
        );

        switch (activeMode) {
          case 'season_complete':
            if (
              isSupported &&
              isExactEpisode(torrent.files[i].name, season, episode)
            ) {
              torrentIndex = i;
              file.deselect();
              file = torrent.files[i];
            }
            break;
          default:
            if (isSupported && torrent.files[i].length > file.length) {
              torrentIndex = i;
              file.deselect();
              file = torrent.files[i];
            }
        }
      }

      if (typeof torrentIndex !== 'number') {
        console.warn('File List', torrent.files.map(_file => _file.name));
        throw new Error(`No torrent could be selected. Torrent Index: ${torrentIndex}`);
      }

      const files = torrent.files;
      file.select();

      const buffer = 5 * 1024 * 1024; // 5MB
      let playerStarted;

      torrent.on('done', () => {
        this.inProgress = false;
        this.clearIntervals();
      });

      this.checkDownloadInterval = setInterval(() => {
        if (!playerStarted && torrent.downloaded > buffer) {
          console.log('Ready...');
          playerStarted = true;
          cb(
            `http://localhost:${port}/${torrentIndex}`,
            file,
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
