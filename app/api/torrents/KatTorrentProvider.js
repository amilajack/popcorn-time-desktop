/**
 * @todo: Migrate to https://isohunt.to
 */

import { search } from 'super-kat';
import {
  getHealth,
  formatSeasonEpisodeToString,
  constructQueries,
  handleError
} from './BaseTorrentProvider';


export default class KatTorrentProvider {

  static fetch(query) {
    return search(query)
      .then(torrents => torrents.map(
        torrent => this.formatTorrent(torrent)
      ))
      .catch(error => {
        handleError(error);
        return [];
      });
  }

  static formatTorrent(torrent) {
    return {
      magnet: torrent.magnet,
      seeders: torrent.seeders,
      leechers: torrent.leechers,
      metadata: String(torrent.title + torrent.magnet) || String(torrent.magnet),
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
            handleError(error);
            return [];
          });
      case 'shows': {
        const { season, episode } = extendedDetails;

        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        )
        .catch(error => {
          handleError(error);
          return [];
        });
      }
      case 'season_complete': {
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
          handleError(error);
          return [];
        });
      }
      default:
        return [];
    }
  }
}
