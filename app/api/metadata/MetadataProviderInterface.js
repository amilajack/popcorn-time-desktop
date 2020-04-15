// @flow
type seasonType = {
  // @DEPRECATE (in favor of .ids)
  id: string,
  ids: {
    imdbId?: string,
    tmdbId?: string,
  },
  title: string,
  season: number,
  overview: string,
  rating: number,
  images: {
    full: string,
    medium: string,
    thumb: string,
  },
};

type episodeType = seasonType & {
  episode: number,
};

export type runtimeType = {
  full: string,
  hours: number,
  minutes: number,
};

export type certificationType = "G" | "PG" | "PG-13" | "R" | "n/a";

export type imagesType = {
  fanart?: {
    full: string,
    medium: string,
    thumb: string,
  },
  poster?: {
    full: string,
    medium: string,
    thumb: string,
  },
};

export type contentType = {
  title: string,
  year: number,
  // @DEPRECATE (in favor of .ids)
  imdbId?: string,
  // @DEPRECATE (in favor of .ids)
  id: string,
  ids: {
    imdbId?: string,
    tmdbId?: string,
  },
  type: "movies" | "shows",
  certification: certificationType,
  summary: string,
  genres: Array<string>,
  rating: number,
  runtime: runtimeType,
  trailer: string | "n/a",
  images: imagesType,
};

type optionsType = {
  sort?: "ratings" | "popular" | "trending",
  genres?: Array<string>,
};

export type methodType = "set" | "get" | "remove";

export interface MetadataProviderInterface {
  getMovies: (
    page: number,
    limit: number,
    options: optionsType
  ) => Promise<contentType>;
  getMovie: (itemId: string) => contentType;
  getShows: (page: number, limit: number) => Promise<contentType>;
  getShow: (itemId: string) => contentType;
  getSimilar: (
    type: string,
    itemId: string,
    limit: number
  ) => Promise<Array<contentType>>;

  supportedIdTypes: Array<"tmdb" | "imdb">;

  getSeasons: (itemId: string) => Promise<Array<seasonType>>;
  getSeason: (itemId: string, season: number) => Promise<episodeType>;
  getEpisode: (itemId: string, season: number, episode: number) => episodeType;

  search: (query: string, page: number) => Promise<Array<contentType>>;

  favorites: (
    method: methodType,
    item?: contentType
  ) => void | Array<contentType>;
  recentlyWatched: (
    method: methodType,
    item?: contentType
  ) => void | Array<contentType>;
  watchList: (
    method: methodType,
    item?: contentType
  ) => void | Array<contentType>;
}
