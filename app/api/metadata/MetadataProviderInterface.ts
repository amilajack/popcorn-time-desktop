export enum ItemKind {
  Movie = "movies",
  Show = "shows",
}

export enum ShowKind {
  Episode = "episode",
  Episodes = "episodes",
  Season = "season",
  Seasons = "seasons",
}

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
  type: ItemKind;
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

export type Method = "set" | "get" | "add" | "remove";

export type UserList<T = Item> = {
  add: (content: T) => Promise<void>;
  get: () => Promise<T[]>;
  remove: (content: Item) => Promise<void>;
  clear: () => Promise<void>;
  has: (item: Item) => Promise<boolean>;
};

export interface MetadataProviderInterface {
  supportedIdTypes: Array<"tmdb" | "imdb">;

  getMovies: (page: number, limit: number, options: Options) => Promise<Item[]>;
  getMovie: (itemId: string) => Promise<Item>;
  getShows: (page: number, limit: number) => Promise<Item[]>;
  getShow: (itemId: string) => Promise<Item>;
  getSimilar: (type: ItemKind, itemId: string) => Promise<Item[]>;

  getSeasons: (itemId: string) => Promise<Season[]>;
  getSeason: (itemId: string, season: number) => Promise<Episode[]>;
  getEpisode: (
    itemId: string,
    season: number,
    episode: number
  ) => Promise<Episode>;

  search: (query: string, page: number) => Promise<Item[]>;

  favorites: UserList;
  recentlyWatched: UserList;
  watchList: UserList;
}
