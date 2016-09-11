import KatShows from 'kat-shows';
import {
  formatSeasonEpisodeToObject
} from './BaseTorrentProvider';


export default class KatShowsTorrentProvider {

  static fetch(showName: string, season: number, episode: number) {
    return KatShows(showName, season, episode)
      .then(torrents => torrents.map(
        torrent => this.formatTorrent(torrent))
      );
  }

  static formatTorrent(torrent: Object) {
    return {
      ...torrent,
      _provider: 'kat-shows'
    };
  }

  static provide(imdbId: string, type: string, extendedDetails: Object = {}) {
    if (!extendedDetails.searchQuery) {
      return new Promise(resolve => resolve([]));
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
