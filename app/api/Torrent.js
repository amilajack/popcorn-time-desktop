/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */
import Peerflix from 'peerflix';


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

    this.engine.server.on('listening',
      () => fn(`http://localhost:${this.engine.server.address().port}/`)
    );

    return this.engine;
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
      this.engine.destroy();
      this.inProgress = false;
    }
  }

  /**
   * Return a magnetURI that is of filetype .mov, ogg
   */
  isNativelyEncoded(magnetURI) {
    // ...
  }

  // pause() {}

  // resume() {}
}
