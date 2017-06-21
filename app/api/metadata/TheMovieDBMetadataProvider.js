// @flow
import fetch from 'isomorphic-fetch';
import axios from 'axios';
import OpenSubtitles from 'opensubtitles-api';
import { set, get } from '../../utils/Config';

const subtitlesEndpoint = 'https://popcorn-time-api-server.herokuapp.com/subtitles';

export default class TheMovieDBMetadataProvider {
  apiKey = '809858c82322872e2be9b2c127ccdcf7';
  imageUri = 'https://image.tmdb.org/t/p/';
  apiUri = 'https://api.themoviedb.org/3/';

  openSubtitles: OpenSubtitles;

  theMovieDB: axios;

  movieGenres: Object;

  constructor() {
    this.theMovieDB = axios.create({
      baseURL: this.apiUri,
      params: { api_key: this.apiKey },
    });

    this.openSubtitles = new OpenSubtitles({
      useragent: 'OSTestUserAgent',
      username: '',
      password: '',
      ssl: true
    });

    // Get movie genres
    this.theMovieDB.get('/genre/movie/list')
      .then(({ data }) => {
        this.movieGenres = {};
        data.genres.forEach(genre => this.movieGenres[genre.id] = genre.name);
      })
  }

  getMovies(page: number = 1): Promise<Object> {
    return this.theMovieDB.get('movie/popular', { params: { page } })
      .then(({ data }) => {
        return data.results.map(movie => formatMetadata.bind(this)(movie, 'movies'))
      });
  }

  getMovie(id: string): Object {
    return this.theMovieDB.get(`movie/${id}`)
      .then(({ data }) => {
        return formatMetadata.bind(this)(data, 'movies')
      });
  }

  getShows(page: number = 1): Promise<Object> {
    return this.theMovieDB.get('tv/popular', { params: { page } })
      .then(({ data }) => {
        return data.results.map(show => formatMetadata.bind(this)(show, 'shows'))
      });
  }

  getShow(id: string): Object {
    return this.theMovieDB.get(`tv/${id}`)
      .then(({ data }) => {
        return formatMetadata.bind(this)(data, 'shows')
      });
  }

  getSeasons(imdbId: string): Array<Object> {
    return this.trakt.seasons.summary({
      id: imdbId,
      extended: 'full,images,metadata'
    })
      .then(res => res.filter(season => season.aired_episodes !== 0).map(season => ({
        season: season.number + 1,
        overview: season.overview,
        id: season.ids.imdb,
        images: {
          full: season.images.poster.full,
          medium: season.images.poster.medium,
          thumb: season.images.poster.thumb
        }
      })));
  }

  getSeason(imdbId: string, season: number): Object {
    return this.trakt.seasons.season({
      id: imdbId,
      season,
      extended: 'full,images,metadata'
    })
      .then(episodes => episodes.map(episode => formatSeason(episode)));
  }

  getEpisode(imdbId: string, season: number, episode: number): Object {
    return this.trakt.episodes.summary({
      id: imdbId,
      season,
      episode,
      extended: 'full,images,metadata'
    })
      .then(res => formatSeason(res));
  }

  search(query: string, page: number = 1): Array<Object> {
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

  /**
   * @param {string} type   | movie or show
   * @param {string} imdbId | movie or show
   */
  getSimilar(type: string = 'movies', imdbId: string, limit: number = 5): Array<Object> {
    return this.trakt[type].related({
      id: imdbId,
      limit,
      extended: 'full,images,metadata'
    })
      .then(movies => movies.map(movie => formatMetadata(movie, type)));
  }

  /**
   * Temporarily store the 'favorites', 'recentlyWatched', 'watchList' items
   * in config file. The cache can't be used because this data needs to be
   * persisted.
   */
  updateConfig(type: string, method: string, metadata: Object) {
    const property = `${type}`;

    switch (method) {
      case 'set':
        set(property, [...(get(property) || []), metadata]);
        return get(property);
      case 'get':
        return get(property);
      case 'remove': {
        const items = [...(get(property) || []).filter(item => item.id !== metadata.id)];
        return set(property, items);
      }
      default:
        return set(property, [...(get(property) || []), metadata]);
    }
  }

  favorites(...args: Array<any>) {
    return this.updateConfig('favorites', ...args);
  }

  recentlyWatched(...args: Array<any>) {
    return this.updateConfig('recentlyWatched', ...args);
  }

  watchList(...args: Array<any>) {
    return this.updateConfig('watchList', ...args);
  }

  async getSubtitles(imdbId: string,
                     filename: string,
                     length: number,
                     metadata: Object = {}): Promise<Object> {
    const { activeMode } = metadata;

    const defaultOptions = {
      sublanguageid: 'eng',
      // sublanguageid: 'all', // @TODO
      // hash: '8e245d9679d31e12', // @TODO
      filesize: length || undefined,
      filename: filename || undefined,
      season: metadata.season || undefined,
      episode: metadata.episode || undefined,
      extensions: ['srt', 'vtt'],
      imdbid: imdbId
    };

    const subtitles = ((): Promise<Object> => {
      switch (activeMode) {
        case 'shows': {
          const { season, episode } = metadata;
          return this.openSubtitles.search({
            ...defaultOptions,
            ...{ season, episode }
          });
        }
        default:
          return this.openSubtitles.search(defaultOptions);
      }
    })();

    return subtitles.then(
      res => Object
        .values(res)
        .map(subtitle => formatSubtitle(subtitle))
    );
  }

  provide() {
  }

  formatImage(path: String, size: String = 'original'): String {
    return `${this.imageUri}${size}/${path}`
  }
}

function formatMetadata(movie: Object = {}, type: string): Object {
  return {
    title: movie.title,
    year: new Date(movie.release_date).getYear(),
    imdbId: null,
    id: '' + movie.id,
    type,
    certification: 'n/a',
    summary: movie.overview,
    genres: movie.genre_ids.map(id => this.movieGenres[id]),
    rating: movie.vote_average,
    runtime: 'n/a',
    trailer: 'n/a',
    images: {
      fanart: {
        full: this.formatImage(movie.poster_path, 'original'),
        medium: this.formatImage(movie.poster_path, 'w780'),
        thumb: this.formatImage(movie.poster_path, 'w342')
      },
      poster: {
        full: this.formatImage(movie.poster_path, 'original'),
        medium: this.formatImage(movie.poster_path, 'w780'),
        thumb: this.formatImage(movie.poster_path, 'w342')
      }
    }
  };
}

function formatMovieSearch(movie: Object): Object {
  return {
    title: movie.Title,
    year: parseInt(movie.Year, 10),
    imdbId: movie.imdbID,
    id: movie.imdbID,
    type: movie.Type.includes('movie') ? 'movies' : 'shows',
    certification: movie.Rated,
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

function formatSeason(season: Object, image: string = 'screenshot'): Object {
  return {
    id: season.ids.imdb,
    title: season.title,
    season: season.season,
    episode: season.number,
    overview: season.overview,
    rating: season.rating ? roundRating(season.rating) : 'n/a',
    images: {
      full: season.images[image].full,
      medium: season.images[image].medium,
      thumb: season.images[image].thumb
    }
  };
}

function roundRating(rating: number): number {
  return Math.round(rating * 10) / 10;
}

function formatSubtitle(subtitle: Object): Object {
  return {
    kind: 'captions',
    label: subtitle.langName,
    srclang: subtitle.lang,
    src: `${subtitlesEndpoint}/${encodeURIComponent(subtitle.url)}`,
    default: subtitle.lang === 'en'
  };
}
