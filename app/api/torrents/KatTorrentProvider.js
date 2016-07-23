/**
 * @todo: Migrate to https://isohunt.to
 */

import { search } from 'super-kat';
import {
  getHealth,
  formatSeasonEpisodeToString,
  constructQueries
} from './BaseTorrentProvider';


export default class KatTorrentProvider {

  static fetch(query) {
    return search(query)
      .then(torrents => torrents.map(
        torrent => this.formatTorrent(torrent)
      ))
      .catch(error => {
        console.log(error);
        return [];
      });
  }

  static formatTorrent(torrent) {
    return {
      magnet: torrent.magnet,
      seeders: torrent.seeders,
      leechers: torrent.leechers,
      metadata: torrent.title + torrent.magnet,
      ...getHealth(torrent.seeders),
      _provider: 'kat'
    };
  }

  static provide(imdbId, type, extendedDetails = {}) {
    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies':
        return this.fetch(searchQuery)
          .catch(error => {
            console.log(error);
            return [];
          });
      case 'shows': {
        const { season, episode } = extendedDetails;

        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        )
        .catch(error => {
          console.log(error);
          return [];
        });
      }
      case 'shows_complete': {
        const { season } = extendedDetails;
        const queries = constructQueries(searchQuery, season);

        return Promise.all(
          queries.map(query => this.fetch(query))
        )
        .then(
          res => res.reduce((previous, current) => (
            previous.length && current.length
              ? [...previous, ...current]
              : previous.length && !current.length
                  ? previous
                  : current
          ))
        )
        .catch(error => {
          console.log(error);
          return [];
        });
      }
      default:
        return [];
    }
  }
}
