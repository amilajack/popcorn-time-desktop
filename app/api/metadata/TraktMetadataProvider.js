import fetch from 'isomorphic-fetch';
import Trakt from 'trakt.tv';
import OpenSubtitles from 'opensubtitles-api';
import { set, get } from '../../utils/Config';
import { convertRuntimeToHours } from './MetadataAdapter';


const subtitlesEndpoint = 'https://popcorn-time-api-server.herokuapp.com/subtitles';

export default class TraktMetadataAdapter {

  clientId = '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2';

  clientSecret = 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1';

  constructor() {
    this.trakt = new Trakt({
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    this.openSubtitles = new OpenSubtitles({
      useragent: 'OSTestUserAgent',
      username: '',
      password: '',
      ssl: true
    });
  }

  getMovies(page: number = 1, limit: number = 50) {
    return this.trakt.movies.popular({
      paginate: true,
      page,
      limit,
      extended: 'full,images,metadata'
    })
      .then(movies => movies.map(movie => formatMetadata(movie, 'movies')));
  }

  getMovie(imdbId: string) {
    return this.trakt.movies.summary({
      id: imdbId,
      extended: 'full,images,metadata'
    })
      .then(movie => formatMetadata(movie, 'movies'));
  }

  getShows(page: number = 1, limit: number = 50) {
    return this.trakt.shows.popular({
      paginate: true,
      page,
      limit,
      extended: 'full,images,metadata'
    })
      .then(shows => shows.map(show => formatMetadata(show, 'shows')));
  }

  getShow(imdbId: string) {
    return this.trakt.shows.summary({
      id: imdbId,
      extended: 'full,images,metadata'
    })
      .then(show => formatMetadata(show, 'shows'));
  }

  getSeasons(imdbId: string) {
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

  getSeason(imdbId: string, season: number) {
    return this.trakt.seasons.season({
      id: imdbId,
      season,
      extended: 'full,images,metadata'
    })
      .then(episodes => episodes.map(episode => formatSeason(episode)));
  }

  getEpisode(imdbId: string, season: number, episode: number) {
    return this.trakt.episodes.summary({
      id: imdbId,
      season,
      episode,
      extended: 'full,images,metadata'
    })
      .then(res => formatSeason(res));
  }

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

  /**
   * @param {string} type   | movie or show
   * @param {string} imdbId | movie or show
   */
  getSimilar(type: string = 'movies', imdbId: string, limit: number = 5) {
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
  _updateConfig(type: string, method: string, metadata: Object) {
    const property = `${type}.items`;

    switch (method) {
      case 'set':
        return set(property, get(property).push(metadata));
      case 'get':
        return get(property);
      case 'remove':
        return set(
          property,
          get(property).filter(item => item.id !== metadata.key)
        );
      default:
        return set(property, get(property).push(metadata));
    }
  }

  favorites(...args) {
    this._updateConfig('favorites', args);
  }

  recentlyWatched(...args) {
    this._updateConfig('recentlyWatched', args);
  }

  watchList(...args) {
    this._updateConfig('watchList', args);
  }

  async getSubtitles(imdbId: string, filename: string, length: number, metadata: Object = {}) {
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

    const subtitles = (() => {
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

  provide() {}
}

function formatMetadata(movie: Object = {}, type: string) {
  return {
    title: movie.title,
    year: movie.year,
    imdbId: movie.ids.imdb,
    id: movie.ids.imdb,
    type,
    certification: movie.certification,
    summary: movie.overview,
    genres: movie.genres,
    rating: movie.rating ? roundRating(movie.rating) : 'n/a',
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

function formatMovieSearch(movie: Object) {
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

function formatSeason(season: Object, image: string = 'screenshot') {
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

function roundRating(rating: number) {
  return Math.round(rating * 10) / 10;
}

function formatSubtitle(subtitle: Object) {
  return {
    kind: 'captions',
    label: subtitle.langName,
    srclang: subtitle.lang,
    src: `${subtitlesEndpoint}/${encodeURIComponent(subtitle.url)}`,
    default: subtitle.lang === 'en'
  };
}
