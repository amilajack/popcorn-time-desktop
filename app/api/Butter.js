/**
 * Method list:
 * https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods
 */

import Trakt from 'trakt.tv';

export default class Butter {

  constructor() {
    this.trakt = new Trakt({
      client_id: '52b30c468753bbcf60a4138f510b3eb655ad6d21f70b4848aa6641381ca7d003',
      client_secret: 'd395c9152654ea6ef4e0107d203b1f217cdf66ed01b6e047fa51a9e8cb93956f'
    });
  }

  async getMovies() {
    return this.trakt.movies.popular({
      paginate: true,
      page: 3,
      limit: 50,
      extended: 'images'
    });
  }

  getMovie(movieId) {
    return this.trakt.movies.summary({
      id: movieId,
      extended: 'full,images,metadata'
    });
  }

  getShows() {}

  getShow() {}
}
