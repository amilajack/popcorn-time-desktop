export type Season = {
  // @DEPRECATE (in favor of .ids)
  id: string;
  ids: {
    imdbId?: string;
    tmdbId?: string;
  };
  title: string;
  season: number;
  overview: string;
  rating: number;
  images: {
    full: string;
    medium: string;
    thumb: string;
  };
};

export type Episode = Season & {
  episode: number;
};

export type Runtime = {
  full: string;
  hours: number;
  minutes: number;
};

export type Certification = "G" | "PG" | "PG-13" | "R" | "n/a";

export type Images = {
  fanart?: {
    full: string;
    medium: string;
    thumb: string;
  };
  poster?: {
    full: string;
    medium: string;
    thumb: string;
  };
};

export type Item = {
  title: string;
  year: number;
  // @DEPRECATE (in favor of .ids)
  imdbId?: string;
  // @DEPRECATE (in favor of .ids)
  id: string;
  ids: {
    imdbId?: string;
    tmdbId?: string;
  };
  type: "movies" | "shows";
  certification: Certification;
  summary: string;
  genres: Array<string>;
  rating: number;
  runtime: Runtime;
  trailer: string | "n/a";
  images: Images;
};

type Options = {
  sort?: "ratings" | "popular" | "trending";
  genres?: Array<string>;
};

export type Method = "set" | "get" | "remove";

export interface MetadataProviderInterface {
  getMovies: (page: number, limit: number, options: Options) => Promise<Item>;
  getMovie: (itemId: string) => Item;
  getShows: (page: number, limit: number) => Promise<Item>;
  getShow: (itemId: string) => Item;
  getSimilar: (
    type: string,
    itemId: string,
    limit: number
  ) => Promise<Array<Item>>;

  supportedIdTypes: Array<"tmdb" | "imdb">;

  getSeasons: (itemId: string) => Promise<Array<Season>>;
  getSeason: (itemId: string, season: number) => Promise<Episode>;
  getEpisode: (itemId: string, season: number, episode: number) => Episode;

  search: (query: string, page: number) => Promise<Array<Item>>;

  favorites: (method: Method, item?: Item) => void | Array<Item>;
  recentlyWatched: (method: Method, item?: Item) => void | Array<Item>;
  watchList: (method: Method, item?: Item) => void | Array<Item>;
}
