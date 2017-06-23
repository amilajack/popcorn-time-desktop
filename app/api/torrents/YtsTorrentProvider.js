// @flow
import fetch from 'isomorphic-fetch';
import {
  determineQuality,
  timeout,
  resolveEndpoint
} from './BaseTorrentProvider';
import type { ProviderInterface } from './ProviderInterface';

const endpoint = 'https://yts.ag';
const providerId = 'YTS';
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

export default class YtsTorrentProvider implements ProviderInterface {
  static providerName = 'YTS';

  static fetch(imdbId: string): Promise<Object> {
    return timeout(
      fetch(
        [
          `${resolvedEndpoint}/api/v2/list_movies.json`,
          `?query_term=${imdbId}`,
          '&order_by=desc&sort_by=seeds&limit=50'
        ].join('')
      )
    ).then(res => res.json());
  }

  static formatTorrent(torrent: Object): Object {
    return {
      quality: determineQuality(torrent.quality),
      magnet: constructMagnet(torrent.hash),
      seeders: parseInt(torrent.seeds, 10),
      leechers: parseInt(torrent.peers, 10),
      metadata:
        String(torrent.url) + String(torrent.hash) || String(torrent.hash),
      _provider: 'yts'
    };
  }

  static getStatus(): Promise<boolean> {
    return fetch('https://yts.ag/api/v2/list_movies.json')
      .then(res => !!res.ok)
      .catch(() => false);
  }

  static provide(imdbId: string, type: string): Promise<Array<Object>> {
    switch (type) {
      case 'movies':
        return this.fetch(imdbId).then(results => {
          if (!results.data.movie_count) return [];
          const torrents = results.data.movies[0].torrents;
          return torrents.map(this.formatTorrent);
        });
      default:
        return Promise.resolve([]);
    }
  }
}

function constructMagnet(hash: string): string {
  return `magnet:?xt=urn:btih:${hash}`;
}
