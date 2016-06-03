import { determineQuality } from './BaseTorrentProvider';
import kat from 'kat-api';


export default class KatTorrentProvider {

  static fetch(imdbId, query = 'mp4') {
    return kat.search({
      query,
      min_seeds: '10',
      sort_by: 'seeders',
      order: 'desc',
      imdb: imdbId,
      verified: 1,
      language: 'en'
    })
    .then(data => data.results)
    .catch(error => {
      console.log(error);
      return [];
    });
  }

  static formatTorrent(torrent) {
    return {
      quality: determineQuality(torrent.magnet),
      magnet: torrent.magnet,
      seeders: parseInt(torrent.seeds, 10),
      leechers: torrent.leechs,
      _provider: 'kat'
    };
  }

  static provide(imdbId) {
    return this.fetch(imdbId)
      .then(
        results => results.splice(0, 10).map(this.formatTorrent)
      )
      .catch(error => {
        console.log(error);
      });
  }
}
