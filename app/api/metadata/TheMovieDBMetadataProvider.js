// @flow
import fetch from 'isomorphic-fetch';
import axios from 'axios';
import { set, get } from '../../utils/Config';
import type { MetadataProviderInterface } from './MetadataProviderInterface';

export default class TheMovieDBMetadataProvider
  implements MetadataProviderInterface {
  apiKey = '809858c82322872e2be9b2c127ccdcf7';

  imageUri = 'https://image.tmdb.org/t/p/';

  apiUri = 'https://api.themoviedb.org/3/';

  theMovieDB: axios;

  movieGenres: {
    [genre: string]: string
  };

  constructor() {
    this.theMovieDB = axios.create({
      baseURL: this.apiUri,
      params: { api_key: this.apiKey }
    });

    // Get movie genres
    this.theMovieDB.get('/genre/movie/list').then(({ data }) => {
      this.movieGenres = {};
      data.genres.forEach(genre => (this.movieGenres[genre.id] = genre.name));
    })
    .catch(console.log);
  }

  getMovies(page: number = 1) {
    return this.theMovieDB
      .get('movie/popular', { params: { page } })
      .then(({ data }) =>
        data.results.map(movie =>
          formatMetadata(movie, 'movies', this.imageUri, this.movieGenres)
        )
      );
  }

  getMovie(id: string) {
    return this.theMovieDB
      .get(`movie/${id}`)
      .then(({ data }) =>
        formatMetadata(data, 'movies', this.imageUri, this.movieGenres)
      );
  }

  getShows(page: number = 1) {
    return this.theMovieDB
      .get('tv/popular', { params: { page } })
      .then(({ data }) =>
        data.results.map(show =>
          formatMetadata(show, 'shows', this.imageUri, this.movieGenres)
        )
      );
  }

  getShow(id: string) {
    return this.theMovieDB
      .get(`tv/${id}`)
      .then(({ data }) =>
        formatMetadata(data, 'shows', this.imageUri, this.movieGenres)
      );
  }

  // getSeasons(imdbId: string) {}

  // getSeason(imdbId: string, season: number) {}

  // getEpisode(imdbId: string, season: number, episode: number) {}

  search(query: string, page: number = 1) {
    if (!query) {
      throw Error('Query paramater required');
    }

    // http://www.omdbapi.com/?t=Game+of+thrones&y=&plot=short&r=json
    return fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&y=&page=${page}`
    )
      .then(response => response.json())
      .then(response => response.Search.map(movie => formatMovieSearch(movie)));
  }

  // getSimilar(type: string = 'movies', imdbId: string, limit: number = 5) {}

  // @TODO: Properly implement provider architecture
  provide() {}
}

function formatImage(
  imageUri,
  path: string,
  size: string = 'original'
): string {
  return `${imageUri}${size}/${path}`;
}

function formatMetadata(
  movie = {},
  type: string,
  imageUri: string,
  movieGenres
) {
  return {
    title: movie.title,
    year: new Date(movie.release_date).getYear(),
    imdbId: null,
    id: `${movie.id}`,
    type,
    certification: 'n/a',
    summary: movie.overview,
    genres: movie.genre_ids.map(id => movieGenres[id]),
    rating: movie.vote_average,
    runtime: 'n/a',
    trailer: 'n/a',
    images: {
      fanart: {
        full: formatImage(imageUri, movie.poster_path, 'original'),
        medium: formatImage(imageUri, movie.poster_path, 'w780'),
        thumb: formatImage(imageUri, movie.poster_path, 'w342')
      },
      poster: {
        full: formatImage(imageUri, movie.poster_path, 'original'),
        medium: formatImage(imageUri, movie.poster_path, 'w780'),
        thumb: formatImage(imageUri, movie.poster_path, 'w342')
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
    type: movie.Type.includes('movie') ? 'movies' : 'shows',
    certification: movie.Rated,
    summary: 'n/a', // omdbapi does not support
    genres: [],
    rating: 'n/a', // omdbapi does not support
    runtime: {
      full: 'n/a', // omdbapi does not support
      hours: 'n/a', // omdbapi does not support
      minutes: 'n/a' // omdbapi does not support
    },
    trailer: 'n/a', // omdbapi does not support
    images: {
      fanart: {
        full: movie.Poster || '',
        medium: movie.Poster || '',
        thumb: movie.Poster || ''
      },
      poster: {
        full: movie.Poster || '',
        medium: movie.Poster || '',
        thumb: movie.Poster || ''
      }
    }
  };
}
