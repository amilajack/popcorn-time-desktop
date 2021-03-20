import axios, { AxiosInstance } from "axios";
import { parseRuntimeMinutesToObject } from "./helpers";
import BaseMetadataProvider from "./BaseMetadataProvider";
import {
  MetadataProviderInterface,
  Item,
  Season,
  Episode,
  Runtime,
  ItemKind,
} from "./MetadataProviderInterface";
import cache from "../helpers/cache-decorator";
import Cache, { PctCache } from "../torrents/Cache";

function formatImage(
  imageUri: string,
  path: string,
  size = "original"
): string {
  return `${imageUri}/${size}/${path}`;
}

type RawItem = {
  name: string;
  title: string;
  release_date: number;
  first_air_date: number;
  videos?: {
    results?: [
      {
        key: string;
      }
    ];
  };
  id: string;
  imdb_id?: string;
  media_type: "movie" | "shows";
  external_ids?: {
    imdb_id?: string;
  };
  overview: string;
  genres?: [{ name: string }];
  genre_ids?: number[];
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  runtime?: number;
  episode_run_time?: number[];
};

type Genres = Record<number, string>;

function formatGenres(item: RawItem, genres: Genres): string[] {
  if (item.genres) {
    return item.genres.map((genre) => genre.name);
  }
  return item.genre_ids ? item.genre_ids.map((genre) => genres[genre]) : [];
}

function formatItem(
  item: RawItem,
  type: ItemKind,
  imageUri: string,
  genres: Genres
): Item {
  const runtime: Runtime =
    item.runtime || item.episode_run_time?.[0]
      ? parseRuntimeMinutesToObject(
          item.runtime || item.episode_run_time?.[0] || 0
        )
      : {
          full: "",
          hours: 0,
          minutes: 0,
        };

  return {
    // 'title' property is on movies only. 'name' property is on
    // shows only
    title: item.name || item.title,
    year: new Date(item.release_date || item.first_air_date).getFullYear(),
    // @DEPRECATE
    id: String(item.id),
    ids: {
      tmdbId: String(item.id),
      // eslint-disable-next-line camelcase
      imdbId: item.imdb_id || item.external_ids?.imdb_id || "",
    },
    type,
    certification: "n/a",
    summary: item.overview,
    genres: formatGenres(item, genres),
    rating: item.vote_average,
    runtime,
    trailer: item.videos?.results?.length
      ? `http://youtube.com/watch?v=${item.videos.results[0].key}`
      : "n/a",
    images: {
      fanart: {
        full: formatImage(imageUri, item.backdrop_path, "original"),
        medium: formatImage(imageUri, item.backdrop_path, "w780"),
        thumb: formatImage(imageUri, item.backdrop_path, "w342"),
      },
      poster: {
        full: formatImage(imageUri, item.poster_path, "original"),
        medium: formatImage(imageUri, item.poster_path, "w780"),
        thumb: formatImage(imageUri, item.poster_path, "w342"),
      },
    },
  };
}

type RawSeasons = {
  id: string;
  name: string;
  overview: string;
  seasons: RawSeason[];
};

function formatSeasons(show: RawSeasons): Season[] {
  const firstSeasonIsZero =
    show.seasons.length > 0 ? show.seasons[0].season_number === 0 : false;

  return show.seasons.map((season) => ({
    title: show.name,
    rating: 0,
    season: firstSeasonIsZero ? season.season_number + 1 : season.season_number,
    overview: show.overview,
    id: String(season.id),
    ids: {
      tmdbId: String(season.id),
    },
    images: {
      full: season.poster_path,
      medium: season.poster_path,
      thumb: season.poster_path,
    },
  }));
}

type RawSeason = {
  id: string;
  poster_path: string;
  season_number: number;
  episodes: RawEpisode[];
};

function formatSeason(season: RawSeason): Episode[] {
  return season.episodes.map((episode) => ({
    id: String(episode.id),
    ids: {
      tmdbId: String(episode.id),
    },
    title: episode.name,
    season: episode.season_number,
    episode: episode.episode_number,
    overview: episode.overview,
    rating: episode.vote_average,
    // rating: episode.rating ? roundRating(episode.rating) : 'n/a',
    images: {
      full: episode.poster_path,
      medium: episode.poster_path,
      thumb: episode.poster_path,
    },
  }));
}

type RawEpisode = {
  id: string;
  name: string;
  season_number: number;
  episode_number: number;
  overview: string;
  vote_average: number;
  still_path: string;
  poster_path: string;
};

function formatEpisode(episode: RawEpisode, imageUri: string): Episode {
  return {
    id: String(episode.id),
    ids: {
      tmdbId: String(episode.id),
    },
    title: episode.name,
    season: episode.season_number,
    episode: episode.episode_number,
    overview: episode.overview,
    rating: episode.vote_average,
    // rating: episode.rating ? roundRating(episode.rating) : 'n/a',
    images: {
      full: formatImage(imageUri, episode.still_path, "original"),
      medium: formatImage(imageUri, episode.still_path, "w780"),
      thumb: formatImage(imageUri, episode.still_path, "w342"),
    },
  };
}

type Results<T> = {
  results: T;
};

export default class TheMovieDbMetadataProvider
  extends BaseMetadataProvider
  implements MetadataProviderInterface {
  private cache: PctCache;

  private readonly apiKey: string = "c8cd3c25956bd78c687685e6dcb82a64";

  private readonly imageUri: string = "https://image.tmdb.org/t/p";

  private readonly apiUri: string = "https://api.themoviedb.org/3";

  readonly supportedIdTypes: Array<"tmdb" | "imdb"> = ["tmdb", "imdb"];

  private readonly genres: Genres = {
    12: "Adventure",
    14: "Fantasy",
    16: "Animation",
    18: "Drama",
    27: "Horror",
    28: "Action",
    35: "Comedy",
    36: "History",
    37: "Western",
    53: "Thriller",
    80: "Crime",
    99: "Documentary",
    878: "Science Fiction",
    9648: "Mystery",
    10402: "Music",
    10749: "Romance",
    10751: "Family",
    10752: "War",
    10770: "TV Movie",
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
  };

  private readonly params = {
    api_key: this.apiKey,
    append_to_response: "external_ids,videos",
  };

  private readonly theMovieDb: AxiosInstance = axios.create({
    baseURL: this.apiUri,
    timeout: 10_000,
    params: this.params,
  });

  constructor(opts: { cache?: PctCache } = {}) {
    super();
    this.cache = opts.cache || new Cache();
  }

  @cache()
  getMovies(page = 1) {
    return this.theMovieDb
      .get<Results<RawItem[]>>("movie/popular", {
        params: {
          page,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((movie) =>
          formatItem(movie, ItemKind.Movie, this.imageUri, this.genres)
        )
      );
  }

  @cache()
  getTrending(limit = 5) {
    return this.theMovieDb
      .get<Results<RawItem[]>>("trending/all/week", {
        params: { ...this.params, limit: 5 },
      })
      .then(({ data }) =>
        data.results
          .map((movie) =>
            formatItem(movie, ItemKind.Movie, this.imageUri, this.genres)
          )
          .slice(0, limit)
      );
  }

  @cache()
  getMovie(itemId: string) {
    return this.theMovieDb
      .get(`movie/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) =>
        formatItem(data, ItemKind.Movie, this.imageUri, this.genres)
      );
  }

  @cache()
  getShows(page = 1) {
    return this.theMovieDb
      .get<Results<RawItem[]>>("tv/popular", {
        params: {
          page,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((show) =>
          formatItem(show, ItemKind.Show, this.imageUri, this.genres)
        )
      );
  }

  @cache()
  getShow(itemId: string): Promise<Item> {
    return this.theMovieDb
      .get(`tv/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) =>
        formatItem(data, ItemKind.Show, this.imageUri, this.genres)
      );
  }

  @cache()
  getSeasons(itemId: string) {
    return this.theMovieDb
      .get(`tv/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) => formatSeasons(data));
  }

  @cache()
  getSeason(itemId: string, season: number) {
    return this.theMovieDb
      .get<RawSeason>(`tv/${itemId}/season/${season}`, {
        params: this.params,
      })
      .then(({ data }) => formatSeason(data));
  }

  @cache()
  getEpisode(itemId: string, season: number, episode: number) {
    return this.theMovieDb
      .get(`tv/${itemId}/season/${season}/episode/${episode}`, {
        params: this.params,
      })
      .then(({ data }) => formatEpisode(data, this.imageUri));
  }

  @cache()
  search(query: string, page = 1) {
    return this.theMovieDb
      .get<Results<RawItem[]>>("search/multi", {
        params: {
          page,
          include_adult: true,
          query,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((result) =>
          formatItem(
            result,
            result.media_type === "movie" ? ItemKind.Movie : ItemKind.Show,
            this.imageUri,
            this.genres
          )
        )
      );
  }

  @cache()
  getSimilar(type: ItemKind = ItemKind.Movie, itemId: string): Promise<Item[]> {
    const urlType = (() => {
      switch (type) {
        case ItemKind.Movie:
          return "movie";
        case ItemKind.Show:
          return "tv";
        default: {
          throw new Error(`Unexpected type "${type}"`);
        }
      }
    })();

    return this.theMovieDb
      .get<Results<RawItem[]>>(`${urlType}/${itemId}/recommendations`, {
        params: this.params,
      })
      .then(({ data }) =>
        data.results.map((movie) =>
          formatItem(movie, type, this.imageUri, this.genres)
        )
      );
  }
}
