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
  start(magnetURI, metadata, cb) {
    if (this.inProgress) {
      throw new Error('Torrent already in progress');
    }

    console.log('starting torrent...');
    this.inProgress = true;
    const { title, season, episode } = metadata;
    console.log(metadata);

    if (process.env.FLAG_SEASON_COMPLETE === 'true' && 'episode' in metadata) {
      this.engine = new WebTorrent();

      this.engine.add(magnetURI, torrent => {
        const server = torrent.createServer();
        server.listen(port);

        let [file] = torrent.files;

        for (let i = 0; i < torrent.files.length; i++) {
          if (
            file.length < torrent.files[i].length &&
            !isExactEpisode(file.path, title, season, episode)
          ) {
            file.deselect();
            file = torrent.files[i];
          }
        }

        console.log(file);
        const files = torrent.files;
        const { name } = file;
        file.select();

        torrent.on('ready', () => {
          cb(
            `http://localhost:${port}/0`,
            name,
            files
          );
        });

        torrent.on('done', () => {
          console.log('killing...');
          server.close();
          this.engine.destroy();
        });
      });
    } else {
      this.engine = new Peerflix(magnetURI);

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

  /**
   * Return a magnetURI that is of filetype .mov, ogg
   */
  static isFormatSupported(magnetURI, nativePlaybackFormats) {
    const webTorrent = new WebTorrent();

    return new Promise(resolve => {
      webTorrent.add(magnetURI, torrent => {
        const exist = torrent.files.find(file => {
          for (const format of nativePlaybackFormats) {
            if (file.path.includes(`.${format}`)) return true;
          }

          return false;
        });

        resolve(!!exist);

        webTorrent.destroy();
      });
    });
  }

  static async getTorrentWithSupportedFormats(torrents, supportedFormats, limit = 5) {
    try {
      if (torrents) {
        return Promise.all(
          torrents
            .filter((_torrent, index) => index < limit)
            .map(
              _torrent => Torrent.isFormatSupported(
                _torrent.magnet,
                supportedFormats
              )
            )
        )
        .then(
          res => (
            res.map((isSupported, index) => ({
              torrent: torrents[index],
              isSupported
            }))
            .find(torrent => torrent.isSupported === true)
            .torrent || undefined
          )
        );
      }
    } catch (error) {
      throw new Error('No with supported video formats could be found, with limit', limit);
    }

    throw new Error('No torrents available, cannot find a supported format');
  }

  destroy() {
    if (this.inProgress) {
      console.log('destroyed torrent...');
      this.engine.remove();
      this.engine.destroy();
      this.inProgress = false;
    }
  }

  // pause() {}

  // resume() {}
}
