/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */
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

    this.engine = new WebTorrent();
    this.engine.add(magnetURI, torrent => {
      console.log('torrent started....');
      console.log('files', torrent.files);

      this.server = torrent.createServer();

      let file = torrent.files[0];
      file.index = 0;

      for (let i = 0; i < torrent.files.length; i++) {
        if (file.length < torrent.files[i].length) {
          file.deselect();
          file = torrent.files[i];
          file.index = i;
        }
      }

      file.select();

      this.file = file;

      console.log({ file });
      fn(file);

      this.server.listen('9090');
    });

    return this.engine;
  }

  ready(fn) {
    console.log('ready setting......');
    this.fn = fn;
  }

  getProgress() {
    const progress = Math.round(
      this.engine.swarm.downloaded / this.engine.torrent.length
    );
    console.log(progress);
  }

  destroy() {
    if (this.inProgress) {
      console.log('destroyed torrent...');
      this.server.close();
      this.engine.destroy();
      this.inProgress = false;
    }
  }

  /**
   * Return a magnetURI that is of filetype .mov, ogg
   */
  // isNativelyEncoded(magnetURI) {
  //   // WebTorrent.
  // }

  // pause() {}

  // resume() {}
}
