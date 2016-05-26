import Trakt from 'trakt.tv';


export default class TraktMetadataAdapter {

  client_id = 'd395c9152654ea6ef4e0107d203b1f217cdf66ed01b6e047fa51a9e8cb93956f';

  client_secret = '52b30c468753bbcf60a4138f510b3eb655ad6d21f70b4848aa6641381ca7d003';

  headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': 2,
    'trakt-api-key': this.client_id
  };

  constructor() {
    this.trakt = new Trakt({
      client_id: this.client_id,
      client_secret: this.client_secret
    });
  }

  getMovies(page = 1, limit = 50) {
    return this.trakt.movies.popular({
      paginate: true,
      page,
      limit,
      extended: 'full,images,metadata'
    })
    .then(movies => movies.map(movie => this.formatMovie(movie)));
  }

  getMovie(movieId) {
    return this.trakt.movies.summary({
      id: movieId,
      extended: 'full,images,metadata'
    })
    .then(response => this.formatMovie(response));
  }

  // getMovie(imdbId) {
  //   return this.trakt.movies.summary({
  //     id: imdbId,
  //     extended: 'full,images,metadata'
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   })
  //   .then(movie => {
  //     console.log(movie);
  //     return movie;
  //   })
  //   // .then(movie => this.formatMovie(movie));
  // }

  formatMovie(movie = {}) {
    return {
      title: movie.title,
      year: movie.year,
      imdbId: movie.ids.imdb,
      id: movie.ids.imdb,
      summary: movie.overview,
      rating: movie.rating ? movie.rating / 2 : 'n/a',
      images: {
        fanart: {
          full: movie.images.fanart.full,
          medium: movie.images.fanart.medium,
          thumb: movie.images.fanart.thumb
        },
        poster: {
          full: movie.images.poster.full,
          medium: movie.images.poster.medium,
          thumb: movie.images.poster.thumb
        }
      }
    };
  }

  search(query, limit, genre, sortBy) {
    return fetch('https://api-v2launch.trakt.tv/search?type=movie&query=batman&year=2015', {
      heades: this.headers
    })
    .then(response => response.json())
    .then(response => response.map(movie => this.formatMovie(movie.movie)));
  }

  provide() {}
}
