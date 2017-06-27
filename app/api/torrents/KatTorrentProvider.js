// @flow
import { search } from 'super-kat';
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

const endpoint = 'https://katproxy.al';
const providerId = 'KAT';
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

export default class KatTorrentProvider implements TorrentProviderInterface {
  static providerName = 'Kat';

  static fetch(query: string) {
    return search(query)
      .then(torrents =>
        torrents
          .map(torrent => this.formatTorrent(torrent))
          .filter(torrent => !!torrent.magnet)
      )
      .catch(error => {
        handleProviderError(error);
        return [];
      });
  }

  static formatTorrent(torrent) {
    return {
      magnet: torrent.magnet,
      seeders: torrent.seeders,
      leechers: torrent.leechers,
      metadata:
        String(torrent.title + torrent.magnet) || String(torrent.magnet),
      _provider: 'kat'
    };
  }

  static getStatus() {
    return fetch(resolvedEndpoint).then(res => res.ok).catch(() => false);
  }

  static provide(itemId: string, type: string, extendedDetails = {}) {
    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies':
        return (
          timeout(
            Promise.all(
              constructMovieQueries(searchQuery, itemId).map(query =>
                this.fetch(query)
              )
            )
          )
            // Flatten array of arrays to an array with no empty arrays
            .then(res => merge(res).filter(array => array.length !== 0))
            .catch(error => {
              handleProviderError(error);
              return [];
            })
        );
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

        return timeout(Promise.all(queries.map(query => this.fetch(query))))
          .then(res =>
            res.reduce(
              (previous, current) =>
                previous.length && current.length
                  ? [...previous, ...current]
                  : previous.length && !current.length ? previous : current
            )
          )
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      }
      default:
        return [];
    }
  }
}
