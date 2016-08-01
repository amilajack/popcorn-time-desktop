/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */
import Peerflix from 'peerflix';
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

    console.log('starting torrent...');
    this.inProgress = true;
    const { season, episode, activeMode } = metadata;

    if (activeMode === 'season_complete') {
      console.warn("Using 'season_complete' method");
      this.engine = new WebTorrent({
        maxConns: process.env.CONFIG_MAX_CONNECTIONS
                    ? parseInt(process.env.CONFIG_MAX_CONNECTIONS, 10)
                    : 100
      });

      this.engine.add(magnetURI, torrent => {
        const server = torrent.createServer();
        server.listen(port);
        this.server = server;

        let [file] = torrent.files;
        let torrentIndex;

        for (let i = 0; i < torrent.files.length; i++) {
          const isSupported = !!supportedFormats
            .find(format => torrent.files[i].name.includes(format));

          console.log(
            torrent.files[i].name,
            isSupported,
            isExactEpisode(torrent.files[i].name, season, episode)
          );

          if (
            isSupported &&
            isExactEpisode(torrent.files[i].name, season, episode)
          ) {
            torrentIndex = i;
            file.deselect();
            file = torrent.files[i];
          }
        }

        if (typeof torrentIndex !== 'number') {
          console.warn('File List', torrent.files.map(_file => _file.name));
          throw new Error(`No torrent could be selected. Torrent Index: ${torrentIndex}`);
        }

        const files = torrent.files;
        const { name } = file;
        file.select();

        const buffer = 5 * 1024 * 1024; // 5MB
        let playerStarted;


        const interval = setInterval(() => {
          console.log(`progress: ${Math.round((torrent.downloaded / file.length) * 100)}%`);
          if (!playerStarted && torrent.downloaded > buffer) {
            console.log('ready...');
            playerStarted = true;
            cb(
              `http://localhost:${port}/${torrentIndex}`,
              name,
              files
            );
            clearInterval(interval);
          }
        }, 1000);
      });
    } else {
      this.engine = new Peerflix(magnetURI, {
        connections: process.env.CONFIG_MAX_CONNECTIONS
                      ? parseInt(process.env.CONFIG_MAX_CONNECTIONS, 10)
                      : 100
      });

      this.engine.server.on('listening', () => {
        const files = this.engine.files.map(({ name, path, length }) => ({
          name, path, length
        }));

        const filename = files
          .map(({ name, path, length }) => ({
            name, path, length
          }))
          .sort((prev, next) => (
            prev.length === next.length
              ? 0
              : (prev.length > next.length ? -1 : 1)
          ))
          [0].path;

        cb(
          `http://localhost:${this.engine.server.address().port}/`,
          filename,
          files
        );
      });
    }
  }

  destroy(torrentEngineName) {
    if (this.inProgress) {
      console.log('Destroyed Torrent...', torrentEngineName);

      if (torrentEngineName === 'webtorrent') {
        console.log('Closing server...');
        if (this.server) {
          this.server.close();
          this.server = undefined;
        }
      }

      // this.engine.remove();
      this.engine.destroy();
      this.engine = undefined;
      this.inProgress = false;
    }
  }
}
