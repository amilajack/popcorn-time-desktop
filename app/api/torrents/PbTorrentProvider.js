/**
 * Pirate Bay torrent provider
 */
import PirateBay from 'thepiratebay';
import {
  getHealth,
  formatSeasonEpisodeToString
} from './BaseTorrentProvider';
import fetch from 'isomorphic-fetch';


export default class PbTorrentProvider {

  static fetch(searchQuery, category = 200) {
    return (
        process.env.NODE_ENV === 'test'
          ?
          PirateBay.search(searchQuery, {
            category,
            orderBy: 'seeds',
            sortBy: 'desc'
          })
          :
          fetch(`https://pirate-bay-endpoint.herokuapp.com/search/${encodeURIComponent(searchQuery)}`)
            .then(res => res.json())
      )
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
