import fetch from 'isomorphic-fetch';
import {
  determineQuality,
  timeout,
  resolveEndpoint
} from './BaseTorrentProvider';


const endpoint = 'https://yts.ag';
const providerId = 'YTS';
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

export default class YtsTorrentProvider {

  static providerName = 'YTS';

  static fetch(imdbId: string) {
    return timeout(
      fetch([
        `${resolvedEndpoint}/api/v2/list_movies.json`,
        `?query_term=${imdbId}`,
        '&order_by=desc&sort_by=seeds&limit=50'
      ].join(''))
    )
      .then(res => res.json());
  }

  static formatTorrent(torrent: Object) {
    return {
      quality: determineQuality(torrent.quality),
      magnet: constructMagnet(torrent.hash),
      seeders: parseInt(torrent.seeds, 10),
      leechers: parseInt(torrent.peers, 10),
      metadata: (String(torrent.url) + String(torrent.hash)) || String(torrent.hash),
      _provider: 'yts'
    };
  }

  static getStatus() {
    return fetch('https://yts.ag/api/v2/list_movies.json')
      .then(res => res.ok)
      .catch(() => false);
  }

  static provide(imdbId: string, type: string) {
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

function constructMagnet(hash: string) {
  return `magnet:?xt=urn:btih:${hash}`;
}
