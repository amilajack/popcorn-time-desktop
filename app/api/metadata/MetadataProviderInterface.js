// @flow
type seasonType = {
  // @DEPRECATE (in favor of .ids)
  id: string,
  ids: {
    imdbId?: string,
    tmdbId?: string
  },
  title: string,
  season: number,
  episode: number,
  overview: string,
  rating: number | 'n/a',
  images: {
    full: string,
    medium: string,
    thumb: string
  }
};

export type runtimeType = {
  full: string,
  hours: number,
  minutes: number
};

export type certificationType = 'G' | 'PG' | 'PG-13' | 'R';

export type imagesType = {
  fanart: {
    full: string,
    medium: string,
    thumb: string
  },
  poster: {
    full: string,
    medium: string,
    thumb: string
  }
};

export type contentType = {
  title: string,
  year: number,
  // @DEPRECATE (in favor of .ids)
  imdbId: string,
  // @DEPRECATE (in favor of .ids)
  id: string,
  ids: {
    imdbId?: string,
    tmdbId?: string
  },
  type: 'movies' | 'shows',
  certification: certificationType,
  summary: string,
  genres: Array<string>,
  rating: number | 'n/a',
  runtime: runtimeType,
  trailer: string | 'n/a',
  images: imagesType
};

export interface MetadataProviderInterface {
  getMovies: (page: number, limit: number) => Promise<contentType>,
  getMovie: (imdbId: string) => contentType,
  getShows: (page: number, limit: number) => Promise<contentType>,
  getShow: (imdbId: string) => contentType,
  getSimilar: (
    type: string,
    imdbId: string,
    limit: number
  ) => Promise<Array<contentType>>,

  getSeasons: (imdbId: string) => Promise<Array<seasonType>>,
  getSeason: (imdbId: string, season: number) => Promise<seasonType>,
  getEpisode: (imdbId: string, season: number, episode: number) => seasonType,

  search: (query: string, page: number) => Promise<Array<contentType>>,

  updateConfig: (type: string, method: string, metadata: contentType) => void,
  favorites: () => void,
  recentlyWatched: () => void,
  watchList: () => void
}
