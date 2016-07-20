/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */
import Peerflix from 'peerflix';
import WebTorrent from 'webtorrent';


export default class Torrent {

  inProgress = false;

  finished = false;

  start(magnetURI, fn) {
    if (this.inProgress) {
      throw new Error('Torrent already in progress');
    }

    console.log('starting torrent...');
    this.inProgress = true;

    this.engine = new Peerflix(magnetURI);

    this.engine.server.on('listening', () => {
      console.log(this.engine.files);
      fn(`http://localhost:${this.engine.server.address().port}/`);
    });

    return this.engine;
  }

  /**
   * Return a magnetURI that is of filetype .mov, ogg
   */
  static isFormatSupported(magnetURI, supportedPlaybackFormats) {
    const webTorrent = new WebTorrent();

    return new Promise(resolve => {
      webTorrent.add(magnetURI, torrent => {
        const exist = torrent.files.find(file => {
          for (const format of supportedPlaybackFormats) {
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
    } catch (err) {
      throw new Error('No with supported video formats could be found, with limit', limit);
    }

    throw new Error('No torrents available, cannot find a supported format');
  }

  destroy() {
    if (this.inProgress) {
      console.log('destroyed torrent...');
      this.engine.destroy();
      this.inProgress = false;
    }
  }

  // pause() {}

  // resume() {}
}
