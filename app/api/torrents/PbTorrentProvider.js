/**
 * Pirate Bay torrent provider
 */
import fetch from 'isomorphic-fetch';
import {
  formatSeasonEpisodeToString,
  constructQueries,
  handleProviderError
} from './BaseTorrentProvider';


const searchEndpoint = 'https://pirate-bay-endpoint.herokuapp.com/search';

export default class PbTorrentProvider {

  static fetch(searchQuery) {
    // HACK: Temporary solution to improve performance by side stepping
    //       PirateBay's database errors.
    const searchQueryUrl = `${searchEndpoint}/${searchQuery}`;

    return Promise.race([
      fetch(searchQueryUrl),
      fetch(searchQueryUrl),
      fetch(searchQueryUrl)
    ])
    .then(res => res.json())
    .then(torrents => torrents.map(
      torrent => this.formatTorrent(torrent)
    ))
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
      metadata: (String(torrent.name) || '') +
                (String(torrent.magnetLink) || '') +
                (String(torrent.link) || ''),
      _provider: 'pb'
    };
  }

  static provide(imdbId, type, extendedDetails = {}) {
    if (!extendedDetails.searchQuery) {
      return new Promise((resolve) => resolve([]));
    }

    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies': {
        return this.fetch(searchQuery)
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      }
      case 'shows': {
        const { season, episode } = extendedDetails;
        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        )
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      }
      case 'season_complete': {
        const { season } = extendedDetails;
        const queries = constructQueries(searchQuery, season);

        return Promise.all(
          queries.map(query => this.fetch(query))
        )
        // Flatten array of arrays to an array with no empty arrays
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
          handleProviderError(error);
          return [];
        });
      }
      default:
        return [];
    }
  }
}
