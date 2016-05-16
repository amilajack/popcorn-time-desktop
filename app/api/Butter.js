/**
 * Method list:
 * https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods
 *
 * @todo: Find a way to get trackers or magnetURI
 * @todo: getMovies should search yts, or provider, instead of trakt.
 * 				Use trakt to fetch information about movies
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

  getMovies(page = 1, limit = 50) {
    return this.trakt.movies.popular({
      paginate: true,
      page,
      limit,
      extended: 'full,images,metadata'
    });
  }

  constructMagnet(hash) {
    return `magnet:?xt=urn:btih:${hash}`;
  }

  /**
   * @todo: Use Promise.all
   */
  async getMovie(movieId) {
    const movieSummary = this.trakt.movies.summary({
      id: movieId,
      extended: 'full,images,metadata'
    });

    const results =
      fetch(`https://yts.ag/api/v2/list_movies.json?query_term=${movieId}?quality=1080`)
        .then(response => response.json());

    // TODO: Refactor by exporting api-specific code. Try to make this into an adapter
    const result = await Promise.all([
      results, movieSummary
    ]);

    // HACK: Filter only 1080p video qualtiy
    const [traktMovieData, ytsTorrentData] = result;

    let magnet = traktMovieData.data.movies[0].torrents.filter(item => {
      return item.quality === '1080p';
    })[0];

    magnet = this.constructMagnet(magnet.hash, magnet.name);

    return Object.assign({}, traktMovieData, ytsTorrentData, { magnet });
  }

  getShows(imdbId) {}

  getShow(imdbId) {}

  search(imdbId) {}

  similar(imdbId) {}
}
