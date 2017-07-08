// @flow
import fetch from 'isomorphic-fetch';
import Trakt from 'trakt.tv';
import { parseRuntimeMinutesToObject } from './MetadataAdapter';
import BaseMetadataProvider from './BaseMetadataProvider';
import type { MetadataProviderInterface } from './MetadataProviderInterface';

export default class TraktMetadataAdapter extends BaseMetadataProvider
  implements MetadataProviderInterface {
  clientId = '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2';

  clientSecret = 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1';

  trakt: Trakt;

  constructor() {
    super();
    this.trakt = new Trakt({
      client_id: this.clientId,
      client_secret: this.clientSecret
    });
  }

  getMovies(page: number = 1, limit: number = 50) {
    return this.trakt.movies
      .popular({
        paginate: true,
        page,
        limit,
        extended: 'full,images,metadata'
      })
      .then(movies => movies.map(movie => formatMetadata(movie, 'movies')));
  }

  getMovie(itemId: string) {
    return this.trakt.movies
      .summary({
        id: itemId,
        extended: 'full,images,metadata'
      })
      .then(movie => formatMetadata(movie, 'movies'));
  }

  getShows(page: number = 1, limit: number = 50) {
    return this.trakt.shows
      .popular({
        paginate: true,
        page,
        limit,
        extended: 'full,images,metadata'
      })
      .then(shows => shows.map(show => formatMetadata(show, 'shows')));
  }

  getShow(itemId: string) {
    return this.trakt.shows
      .summary({
        id: itemId,
        extended: 'full,images,metadata'
      })
      .then(show => formatMetadata(show, 'shows'));
  }

  getSeasons(itemId: string) {
    return this.trakt.seasons
      .summary({
        id: itemId,
        extended: 'full,images,metadata'
      })
      .then(res =>
        res.filter(season => season.aired_episodes !== 0).map(season => ({
          season: season.number + 1,
          overview: season.overview,
          id: season.ids.imdb,
          images: {
            full: season.images.poster.full,
            medium: season.images.poster.medium,
            thumb: season.images.poster.thumb
          }
        }))
      );
  }

  getSeason(itemId: string, season: number) {
    return this.trakt.seasons
      .season({
        id: itemId,
        season,
        extended: 'full,images,metadata'
      })
      .then(episodes => episodes.map(episode => formatSeason(episode)));
  }

  getEpisode(itemId: string, season: number, episode: number) {
    return this.trakt.episodes
      .summary({
        id: itemId,
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
   * @param {string} itemId | movie or show
   */
  getSimilar(type: string = 'movies', itemId: string, limit: number = 5) {
    return this.trakt[type]
      .related({
        id: itemId,
        limit,
        extended: 'full,images,metadata'
      })
      .then(movies => movies.map(movie => formatMetadata(movie, type)));
  }

  // @TODO: Properly implement provider architecture
  provide() {}
}

function formatMetadata(movie = {}, type: string) {
  return {
    title: movie.title,
    year: movie.year,
    // @DEPRECATE
    id: movie.ids.imdb,
    ids: {
      imdbId: movie.ids.imdb
    },
    type,
    certification: movie.certification,
    summary: movie.overview,
    genres: movie.genres,
    rating: movie.rating ? roundRating(movie.rating) : 'n/a',
    runtime: parseRuntimeMinutesToObject(movie.runtime),
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
    // @DEPRECATE
    id: movie.imdbID,
    ids: {
      imdbId: movie.imdbID
    },
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

function formatSeason(season, image: string = 'screenshot') {
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
