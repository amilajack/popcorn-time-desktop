/* eslint new-cap: 0 */
import KatShows from 'kat-shows';
import {
  determineQuality, getHealth
} from './BaseTorrentProvider';


export default class KatShowsTorrentProvider {

  static fetch(showName, season, episode) {
    return KatShows(showName, season, episode)
      .then(torrents => torrents.map(
        torrent => this.formatTorrent(torrent))
      );
  }

  static formatTorrent(torrent) {
    return {
      ...torrent,
      ...getHealth(torrent.seeders, torrent.seeders, torrent.leechers),
      quality: determineQuality(torrent.magnet),
      _provider: 'kat-shows'
    };
  }

  static provide(imdbId, type, extendedDetails = {}) {
    if (!extendedDetails.searchQuery) {
      return new Promise((resolve) => resolve([]));
    }

    switch (type) {
      case 'shows': {
        const { season, episode, searchQuery } = extendedDetails;

        return this.fetch(searchQuery, `0${season}`, `0${episode}`)
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
