/**
 * Pirate Bay torrent provider
 */
import fetch from 'isomorphic-fetch';
import {
  getHealth,
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject
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
      console.log(error);
      return [];
    });
  }

  static formatTorrent(torrent) {
    return {
      magnet: torrent.magnetLink,
      seeders: parseInt(torrent.seeders, 10),
      leechers: parseInt(torrent.leechers, 10),
      metadata: `${torrent.name}${torrent.magnetLink}${torrent.link}`,
      ...getHealth(torrent.seeders),
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
            console.log(error);
            return [];
          });
      }
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
        const { season, episode } = extendedDetails;
        const formattedSeasonNumber = `s${formatSeasonEpisodeToObject(season, episode).season}`;
        const queries = [
          `${searchQuery} season ${season}`,
          `${searchQuery} season ${season} complete`,
          `${searchQuery} ${formattedSeasonNumber} complete`,
          `${searchQuery} season ${season} ${formattedSeasonNumber} complete`
        ];

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
          console.log(error);
          return [];
        });
      }
      default:
        return [];
    }
  }
}
