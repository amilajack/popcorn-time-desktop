/* eslint new-cap: 0 */
import KatShows from 'kat-shows';
import {
  getHealth,
  formatSeasonEpisodeToObject
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
        const formattedDetails = formatSeasonEpisodeToObject(season, episode);

        return this.fetch(searchQuery, formattedDetails.season, formattedDetails.episode)
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
