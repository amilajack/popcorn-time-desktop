/**
 * Method list:
 * https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods
 *
 * @todo: find a way to get trackers or magnetURI
 */

import Trakt from 'trakt.tv';
import Kat from 'kat-api';

export default class Butter {

  constructor() {
    this.trakt = new Trakt({
      client_id: '52b30c468753bbcf60a4138f510b3eb655ad6d21f70b4848aa6641381ca7d003',
      client_secret: 'd395c9152654ea6ef4e0107d203b1f217cdf66ed01b6e047fa51a9e8cb93956f'
    });
  }

  getTorrent(imdb) {
    return Kat.search({
      imdb,
      sort_by: 'seeders',
      order: 'desc',
      verified: 1
    });
  }

  getMovies() {
    return this.trakt.movies.popular({
      paginate: true,
      page: 3,
      limit: 50,
      extended: 'full,images,metadata'
    });
  }

  constructMagnet(hash, title) {
    const trackers = [
      'udp://glotorrents.pw:6969/announce',
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://torrent.gresille.org:80/announce',
      'udp://tracker.openbittorrent.com:80',
      'udp://tracker.coppersurfer.tk:6969',
      'udp://tracker.leechers-paradise.org:6969',
      'udp://p4p.arenabg.ch:1337',
      'udp://tracker.internetwarriors.net:1337'
    ];

    const magnet = `magnet:?xt=urn:btih:${hash}`;

    return magnet;
  }

  async getMovie(movieId) {
    const movieSummary = await this.trakt.movies.summary({
      id: movieId,
      extended: 'full,images,metadata'
    });

    const results = await fetch(`https://yts.ag/api/v2/list_movies.json?query_term=${movieId}?quality=1080`)
                      .then(response => response.json());

    // HACK: Filter only 1080p video qualtiy
    // TODO: Refactor by exporting api-specific code. Try to make this into an adapter
    let magnet = results.data.movies[0].torrents.filter(item => {
      return item.quality === '1080p';
    })[0];

    magnet = this.constructMagnet(magnet.hash, magnet.name);

    return Object.assign({}, movieSummary, results, { magnet });
  }

  getShows() {}

  getShow() {}
}
