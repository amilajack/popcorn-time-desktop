import { determineQuality } from './BaseTorrentProvider';
import fetch from 'isomorphic-fetch';


export default class YtsTorrentProvider {

  static fetch(imdbId) {
    return fetch(`https://yts.ag/api/v2/list_movies.json?query_term=${imdbId}`)
      .then(response => response.json());
  }

  static formatTorrent(torrent) {
    return {
      quality: determineQuality(torrent.quality),
      magnet: constructMagnet(torrent.hash),
      seeders: torrent.seeds,
      leechers: 'n/a'
    };
  }

  static provide(imdbId) {
    return this.fetch(imdbId)
      .then(results => {
        if (!results.data.movie_count) return [];
        const torrents = results.data.movies[0].torrents;
        return torrents.splice(0, 10).map(this.formatTorrent);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function constructMagnet(hash) {
  return `magnet:?xt=urn:btih:${hash}`;
}
