/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */

import peerflix from 'peerflix';
// import WebTorrent from 'webtorrent';


export default class Torrent {

  inProgress = false;

  finished = false;

  start(magnetURI) {
    if (this.inProgress) {
      throw Error('Torrent already in progress');
    }

    console.log('starting torrent...');
    this.inProgress = true;
    this.engine = peerflix(magnetURI);
    return this.engine;
  }

  /**
   * @todo: wait on issue: https://github.com/mafintosh/torrent-stream/issues/71
   */
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
  // isNativelyEncoded(magnetURI) {
  //   // WebTorrent.
  // }

  // pause() {}

  // resume() {}
}
