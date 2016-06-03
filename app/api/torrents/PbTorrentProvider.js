/**
 * Pirate Bay torrent provider
 */
import { determineQuality } from './BaseTorrentProvider';
import PirateBay from 'thepiratebay-new';


export default class PbTorrentProvider {

  static fetch(searchQuery) {
    return PirateBay.search(searchQuery, {
      category: 200,
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
      _provider: 'pb'
    };
  }

  static provide(imdbId, extendedDetails = {}) {
    if (!extendedDetails.searchQuery) {
      return new Promise((resolve, reject) => resolve([]));
    }

    return this.fetch(extendedDetails.searchQuery);
  }
}
