// @flow
type seasonType = {
  id: string,
  title: string,
  season: number,
  episode: number,
  overview: string,
  rating: number | 'n/a',
  images: {
    full: string,
    medium: string,
    thumb: string,
  }
};

export type runtimeType = {
  full: number | 'n/a',
  hours: number | 'n/a',
  minutes: number | 'n/a'
};

export type contentType = {
  title: string,
  year: number,
  imdbId: string,
  id: string,
  type: 'movies' | 'shows',
  certification: string,
  summary: string,
  genres: Array<string>,
  rating: number | 'n/a',
  runtime: runtimeType,
  trailer: string | 'n/a',
  images: {
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
  }
};

export interface MetadataInterface {
  getMovies: (page: number, limit: number) => Promise<contentType>,
  getMovie: (imdbId: string) => contentType,
  getShows: (page: number, limit: number) => Promise<contentType>,
  getShow: (imdbId: string) => contentType,
  getSimilar: (type: string, imdbId: string, limit: number) => Promise<Array<contentType>>,

  getSeasons: (imdbId: string) => Promise<Array<seasonType>>,
  getSeason: (imdbId: string, season: number) => Promise<seasonType>,
  getEpisode: (imdbId: string, season: number, episode: number) => seasonType,

  search: (query: string, page: number) => Promise<Array<contentType>>,

  updateConfig: (type: string, method: string, metadata: contentType) => void,
  favorites: () => void,
  recentlyWatched: () => void,
  watchList: () => void,
}
