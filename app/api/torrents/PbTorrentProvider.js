/**
 * Pirate Bay torrent provider
 * @flow
 */
import fetch from 'isomorphic-fetch';
import {
  formatSeasonEpisodeToString,
  constructSeasonQueries,
  constructMovieQueries,
  merge,
  timeout,
  handleProviderError,
  resolveEndpoint
} from './BaseTorrentProvider';
import type { TorrentProviderInterface } from './TorrentProviderInterface';

const endpoint = 'https://pirate-bay-endpoint.herokuapp.com';
const providerId = 'PB';
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

export default class PbTorrentProvider implements TorrentProviderInterface {
  static providerName = 'PirateBay';

  static fetch(searchQuery: string) {
    // HACK: Temporary solution to improve performance by side stepping
    //       PirateBay's database errors.
    const searchQueryUrl = `${resolvedEndpoint}/search/${searchQuery}`;

    return timeout(fetch(searchQueryUrl))
      .then(res => res.json())
      .then(torrents => torrents.map(torrent => this.formatTorrent(torrent)))
      .catch(error => {
        handleProviderError(error);
        return [];
      });
  }

  static formatTorrent(torrent) {
    return {
      magnet: torrent.magnetLink,
      seeders: parseInt(torrent.seeders, 10),
      leechers: parseInt(torrent.leechers, 10),
      metadata:
        (String(torrent.name) || '') +
          (String(torrent.magnetLink) || '') +
          (String(torrent.link) || ''),
      _provider: 'pb'
    };
  }

  static getStatus(): Promise<boolean> {
    return fetch(resolvedEndpoint).then(res => res.ok).catch(() => false);
  }

  static provide(itemId: string, type: string, extendedDetails = {}) {
    if (!extendedDetails.searchQuery) {
      return new Promise(resolve => resolve([]));
    }

    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies': {
        return (
          Promise.all(
            constructMovieQueries(searchQuery, itemId).map(query =>
              this.fetch(query)
            )
          )
            // Flatten array of arrays to an array with no empty arrays
            .then(res => merge(res).filter(array => array.length !== 0))
            .catch(error => {
              handleProviderError(error);
              return [];
            })
        );
      }
      case 'shows': {
        const { season, episode } = extendedDetails;
        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        ).catch(error => {
          handleProviderError(error);
          return [];
        });
      }
      case 'season_complete': {
        const { season } = extendedDetails;
        const queries = constructSeasonQueries(searchQuery, season);

        return (
          Promise.all(queries.map(query => this.fetch(query)))
            // Flatten array of arrays to an array with no empty arrays
            .then(res => merge(res).filter(array => array.length !== 0))
            .catch(error => {
              handleProviderError(error);
              return [];
            })
        );
      }
      default:
        return [];
    }
  }
}
