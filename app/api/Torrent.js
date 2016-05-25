/**
 * Torrents controller, responsible for playing, stoping, etc
 * Serves as an abstraction layer for peerflix or other torrent streams
 */

import peerflix from 'peerflix';


export default class Torrent {

  inProgress = false;

  finished = false;

  start(magnetURI) {
    console.log('starting torrent...');
    this.engine = peerflix(magnetURI);
    return this.engine;
  }

  destroy() {
    console.log('destroyed torrent');
    this.engine.destroy();
  }

  // progress() {}

  // pause() {}

  // resume() {}
}
