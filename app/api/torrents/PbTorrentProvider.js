/**
 * Pirate Bay torrent provider
 */
import fetch from 'isomorphic-fetch';
import {
  getHealth,
  formatSeasonEpisodeToString
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
      metadata: torrent.name + torrent.magnetLink + torrent.link,
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
          .catch(err => {
            console.log(err);
            return [];
          });
      }
      // temporarily disable shows because of PirateBay outage issues
      case 'shows': {
        const { season, episode } = extendedDetails;
        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        )
          .catch(err => {
            console.log(err);
            return [];
          });
      }
      default:
        return [];
    }
  }
}
