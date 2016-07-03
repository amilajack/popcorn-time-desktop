import kat from 'kat-api';
import {
  determineQuality, getHealth, formatSeasonEpisodeToString
} from './BaseTorrentProvider';


export default class KatTorrentProvider {

  static fetch(imdbId, type, query) {
    return kat.search({
      query
    })
    .then(
      resp => resp.results.map(res => this.formatTorrent(res))
    )
    .catch(error => {
      console.log(error);
      return [];
    });
  }

  static formatTorrent(torrent) {
    return {
      quality: determineQuality(torrent.magnet),
      magnet: torrent.magnet,
      seeders: torrent.seeds,
      leechers: torrent.leechs,
      ...getHealth(torrent.seeds, torrent.peers, torrent.leechs),
      _provider: 'kat'
    };
  }

  static provide(imdbId, type, extendedDetails = {}) {
    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies':
        return this.fetch(imdbId, type, searchQuery)
          .catch(error => {
            console.log(error);
            return [];
          });
      case 'shows': {
        const { season, episode } = extendedDetails;

        return this.fetch(
          imdbId,
          type,
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
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
