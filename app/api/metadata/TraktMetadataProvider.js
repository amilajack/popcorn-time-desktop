/**
 * @todo: Filter and sort by options
 */
import Trakt from 'trakt.tv';
import fetch from 'isomorphic-fetch';
import { convertRuntimeToHours } from './MetadataAdapter';


export default class TraktMetadataAdapter {

  client_id = '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2';

  client_secret = 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1';

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
   * @todo: migrate from omdbapi to an api that can provide more information
   */
  search(query, type = 'movie', page = 1) {
    if (!query) {
      throw Error('query paramater required');
    }

    return fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${type}&page=${page}`
    )
      .then(response => response.json())
      .then(response => response.Search.map(movie => formatMovieSearch(movie)));
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
    genres: movie.genres,
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

function formatMovieSearch(movie) {
  return {
    title: movie.Title,
    year: parseInt(movie.Year, 10),
    imdbId: movie.imdbID,
    id: movie.imdbID,
    summary: 'n/a',  // omdbapi does not support
    genres: [],
    rating: 'n/a',   // omdbapi does not support
    runtime: {
      full: 'n/a',   // omdbapi does not support
      hours: 'n/a',  // omdbapi does not support
      minutes: 'n/a' // omdbapi does not support
    },
    trailer: 'n/a',  // omdbapi does not support
    images: {
      fanart: {
        full: movie.Poster,
        medium: movie.Poster,
        thumb: movie.Poster
      },
      poster: {
        full: movie.Poster,
        medium: movie.Poster,
        thumb: movie.Poster
      }
    }
  };
}
