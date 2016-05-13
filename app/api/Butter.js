import Trakt from 'trakt.tv';

export default class Butter {

  constructor() {
    this.trakt = new Trakt({
      client_id: '52b30c468753bbcf60a4138f510b3eb655ad6d21f70b4848aa6641381ca7d003',
      client_secret: 'd395c9152654ea6ef4e0107d203b1f217cdf66ed01b6e047fa51a9e8cb93956f'
    });
  }

  getMovies() {
    return this.trakt.movies.popular({
      paginate: true,
      extended: 'images'
    });
  }

  getMovie() {}

  getShows() {}

  getShow() {}
}
