import Trakt from 'trakt.tv';
import fetch from 'isomorphic-fetch';
import { convertRuntimeToHours } from './MetadataAdapter';


export const CLIENT_ID = '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2';
export const CLIENT_SECRET = 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1';

export default class TraktMetadataProvider {

  constructor() {
    this.trakt = new Trakt({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });
  }

  getMovies(page = 1, limit = 50) {
    return this.trakt.movies.popular({
      paginate: true,
      page,
      limit,
      extended: 'full,images,metadata'
    })
    .then(movies => movies.map(movie => formatMovie(movie)));
  }

  getMovie(imdbId) {
    return this.trakt.movies.summary({
      id: imdbId,
      extended: 'full,images,metadata'
    })
    .then(response => formatMovie(response));
  }

  /**
   * @param {string} type   | movie or show
   * @param {string} imdbId | movie or show
   */
  similar(type = 'movie', imdbId, limit = 5) {
    return this.trakt[`${type}s`].related({
      id: imdbId,
      limit,
      extended: 'full,images,metadata'
    })
    .then(movies => movies.map(movie => formatMovie(movie)));
  }

  provide() {}
}

export function formatMovie(movie = {}) {
  return {
    title: movie.title,
    year: movie.year,
    imdbId: movie.ids.imdb,
    id: movie.ids.imdb,
    summary: movie.overview,
    rating: movie.rating ? movie.rating / 2 : 'n/a',
    runtime: convertRuntimeToHours(movie.runtime),
    trailer: movie.trailer,
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
