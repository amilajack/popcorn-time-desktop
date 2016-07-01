/**
 * Pirate Bay torrent provider
 */
import PirateBay from 'thepiratebay';
import {
  determineQuality, getHealth, formatSeasonEpisodeToString
} from './BaseTorrentProvider';


export default class PbTorrentProvider {

  static fetch(searchQuery, category) {
    return PirateBay.search(searchQuery, {
      category,
      orderBy: 'seeds',
      sortBy: 'desc'
    })
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
      quality: determineQuality(torrent.magnetLink),
      magnet: torrent.magnetLink,
      seeders: parseInt(torrent.seeders, 10),
      leechers: parseInt(torrent.leechers, 10),
      ...getHealth(torrent.seeders, torrent.peers),
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
        return this.fetch(searchQuery, 200);
      }
      case 'shows': {
        const { season, episode } = extendedDetails;
        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`,
          208
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
