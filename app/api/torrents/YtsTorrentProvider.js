import fetch from 'isomorphic-fetch';
import { determineQuality, getHealth } from './BaseTorrentProvider';


export default class YtsTorrentProvider {

  static fetch(imdbId) {
    return fetch(
      `https://yts.ag/api/v2/list_movies.json?query_term=${imdbId}&order_by=desc&sort_by=seeds&limit=50`
    )
      .then(response => response.json());
  }

  static formatTorrent(torrent) {
    return {
      quality: determineQuality(torrent.quality),
      magnet: constructMagnet(torrent.hash),
      seeders: parseInt(torrent.seeds, 10),
      leechers: 0,
      metadata: torrent.url + torrent.hash,
      ...getHealth(torrent.seeds, torrent.peers),
      _provider: 'yts'
    };
  }

  static provide(imdbId, type) {
    switch (type) {
      case 'movies':
        return this.fetch(imdbId)
          .then(results => {
            if (!results.data.movie_count) return [];
            const torrents = results.data.movies[0].torrents;
            return torrents.map(this.formatTorrent);
          });
      default:
        return [];
    }
  }
}

function constructMagnet(hash) {
  return `magnet:?xt=urn:btih:${hash}`;
}
