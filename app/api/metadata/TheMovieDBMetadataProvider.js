// @flow
import fetch from 'isomorphic-fetch';
import axios from 'axios';
import { parseRuntimeMinutesToObject } from './MetadataAdapter';
import type { MetadataProviderInterface } from './MetadataProviderInterface';

export default class TheMovieDBMetadataProvider
  implements MetadataProviderInterface {
  apiKey = '809858c82322872e2be9b2c127ccdcf7';

  imageUri = 'https://image.tmdb.org/t/p/';

  apiUri = 'https://api.themoviedb.org/3/';

  genres = {
    '12': 'Adventure',
    '14': 'Fantasy',
    '16': 'Animation',
    '18': 'Drama',
    '27': 'Horror',
    '28': 'Action',
    '35': 'Comedy',
    '36': 'History',
    '37': 'Western',
    '53': 'Thriller',
    '80': 'Crime',
    '99': 'Documentary',
    '878': 'Science Fiction',
    '9648': 'Mystery',
    '10402': 'Music',
    '10749': 'Romance',
    '10751': 'Family',
    '10752': 'War',
    '10770': 'TV Movie',
    '10759': 'Action & Adventure',
    '10762': 'Kids',
    '10763': 'News',
    '10764': 'Reality',
    '10765': 'Sci-Fi & Fantasy',
    '10766': 'Soap',
    '10767': 'Talk',
    '10768': 'War & Politics'
  };

  theMovieDb: axios;

  movieGenres: {
    [genre: string]: string
  };

  constructor() {
    this.theMovieDb = axios.create({
      baseURL: this.apiUri,
      params: { api_key: this.apiKey }
    });
  }

  getMovies(page: number = 1) {
    return this.theMovieDb
      .get('movie/popular', { params: { page } })
      .then(({ data }) =>
        data.results.map(movie =>
          formatMetadata(movie, 'movies', this.imageUri, this.genres)
        )
      );
  }

  getMovie(id: string) {
    return this.theMovieDb
      .get(`movie/${id}`)
      .then(({ data }) =>
        formatMetadata(data, 'movies', this.imageUri, this.genres)
      );
  }

  getShows(page: number = 1) {
    return this.theMovieDb
      .get('tv/popular', { params: { page } })
      .then(({ data }) =>
        data.results.map(show =>
          formatMetadata(show, 'shows', this.imageUri, this.genres)
        )
      );
  }

  getShow(id: string) {
    return this.theMovieDb
      .get(`tv/${id}`)
      .then(({ data }) =>
        formatMetadata(data, 'shows', this.imageUri, this.genres)
      );
  }

  // getSeasons(itemId: string) {}

  // getSeason(itemId: string, season: number) {}

  // getEpisode(itemId: string, season: number, episode: number) {}

  search(query: string, page: number = 1) {
    if (!query) {
      throw Error('Query paramater required');
    }

    // http://www.omdbapi.com/?t=Game+of+thrones&y=&plot=short&r=json
    return fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(
        query
      )}&page=${page}&apikey=fcbd49b5`
    )
      .then(response => response.json())
      .then(response => response.Search.map(movie => formatMovieSearch(movie)));
  }

  getSimilar(type: string = 'movies', itemId: string, limit: number = 5) {
    const urlType = (() => {
      switch (type) {
        case 'movies':
          return 'movie';
        case 'shows':
          return 'tv';
        default: {
          throw new Error(`Unexpect type "${type}"`);
        }
      }
    })();

    return this.theMovieDb
      .get(`${urlType}/${itemId}/recommendations`)
      .then(({ data }) =>
        data.results
          .map(movie =>
            formatMetadata(movie, 'movies', this.imageUri, this.genres)
          )
          .filter((each, index) => index <= limit - 1)
      );
  }

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

function formatMetadata(movie, type: string, imageUri: string, genres) {
  return {
    // 'title' property is on movies only. 'name' property is on
    // shows only
    title: movie.name || movie.title,
    year: new Date(movie.release_date).getFullYear(),
    // @DEPRECATE
    id: String(movie.id),
    ids: {
      tmdbId: movie.id,
      imdbId: movie.imdb_id
    },
    type,
    certification: 'n/a',
    summary: movie.overview,
    genres: movie.genres
      ? movie.genres.map(genre => genre.name)
      : movie.genre_ids.map(genre => genres[String(genre)]),
    rating: movie.vote_average,
    runtime: movie.runtime ? parseRuntimeMinutesToObject(movie.runtime) : 'n/a',
    trailer: 'n/a',
    images: {
      fanart: {
        full: formatImage(imageUri, movie.backdrop_path, 'original'),
        medium: formatImage(imageUri, movie.backdrop_path, 'w780'),
        thumb: formatImage(imageUri, movie.backdrop_path, 'w342')
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
    // @DEPRECATE
    id: movie.imdbID,
    ids: {
      imdbId: movie.imdbID
    },
    type: movie.Type.includes('movie') ? 'movies' : 'shows',
    certification: movie.Rated,
    summary: 'n/a',
    genres: [],
    rating: 'n/a',
    runtime: {
      full: 'n/a',
      hours: 'n/a',
      minutes: 'n/a'
    },
    trailer: 'n/a',
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
