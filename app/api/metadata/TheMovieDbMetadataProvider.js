// @flow
import axios from "axios";
import { parseRuntimeMinutesToObject } from "./helpers";
import BaseMetadataProvider from "./BaseMetadataProvider";
import type { MetadataProviderInterface } from "./MetadataProviderInterface";

function formatImage(
  imageUri,
  path: string,
  size: string = "original"
): string {
  return `${imageUri}${size}/${path}`;
}

function formatMetadata(item, type: string, imageUri: string, genres) {
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
    type: "first_air_date" in item ? "shows" : type,
    certification: "n/a",
    summary: item.overview,
    genres: item.genres
      ? item.genres.map((genre) => genre.name)
      : item.genre_ids
      ? item.genre_ids.map((genre) => genres[String(genre)])
      : [],
    rating: item.vote_average,
    runtime:
      item.runtime || item.episode_run_time?.length
        ? parseRuntimeMinutesToObject(
            type === "movies" ? item.runtime : item.episode_run_time[0]
          )
        : {
            full: 0,
            hours: 0,
            minutes: 0,
          },
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

function formatSeasons(show) {
  const firstSeasonIsZero =
    show.seasons.length > 0 ? show.seasons[0].season_number === 0 : false;

  return show.seasons.map((season) => ({
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

function formatSeason(season) {
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

function formatEpisode(episode, imageUri) {
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

export default class TheMovieDbMetadataProvider extends BaseMetadataProvider
  implements MetadataProviderInterface {
  apiKey = "c8cd3c25956bd78c687685e6dcb82a64";

  imageUri = "https://image.tmdb.org/t/p/";

  apiUri = "https://api.themoviedb.org/3/";

  genres = {
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

  theMovieDb: axios;

  movieGenres: {
    [genre: string]: string,
  };

  constructor() {
    super();
    this.theMovieDb = axios.create({
      baseURL: this.apiUri,
      timeout: 10000,
    });
    this.params = {
      api_key: this.apiKey,
      append_to_response: "external_ids,videos",
    };
  }

  getMovies(page: number = 1) {
    return this.theMovieDb
      .get("movie/popular", {
        params: {
          page,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((movie) =>
          formatMetadata(movie, "movies", this.imageUri, this.genres)
        )
      );
  }

  getTrending(limit: number = 5) {
    return this.theMovieDb
      .get("trending/all/week", { params: { ...this.params, limit: 5 } })
      .then(({ data }) =>
        data.results
          .map((movie) =>
            formatMetadata(movie, "movies", this.imageUri, this.genres)
          )
          .slice(0, limit)
      );
  }

  getMovie(itemId: string) {
    return this.theMovieDb
      .get(`movie/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) =>
        formatMetadata(data, "movies", this.imageUri, this.genres)
      );
  }

  getShows(page: number = 1) {
    return this.theMovieDb
      .get("tv/popular", {
        params: {
          page,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((show) =>
          formatMetadata(show, "shows", this.imageUri, this.genres)
        )
      );
  }

  getShow(itemId: string) {
    return this.theMovieDb
      .get(`tv/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) =>
        formatMetadata(data, "shows", this.imageUri, this.genres)
      );
  }

  getSeasons(itemId: string) {
    return this.theMovieDb
      .get(`tv/${itemId}`, {
        params: this.params,
      })
      .then(({ data }) => formatSeasons(data));
  }

  getSeason(itemId: string, season: number) {
    return this.theMovieDb
      .get(`tv/${itemId}/season/${season}`, {
        params: this.params,
      })
      .then(({ data }) => formatSeason(data));
  }

  getEpisode(itemId: string, season: number, episode: number) {
    return this.theMovieDb
      .get(`tv/${itemId}/season/${season}/episode/${episode}`, {
        params: this.params,
      })
      .then(({ data }) => formatEpisode(data, this.imageUri));
  }

  search(query: string, page: number = 1) {
    return this.theMovieDb
      .get("search/multi", {
        params: {
          page,
          include_adult: true,
          query,
          ...this.params,
        },
      })
      .then(({ data }) =>
        data.results.map((result) =>
          formatMetadata(
            result,
            result.media_type === "movie" ? "movies" : "shows",
            this.imageUri,
            this.genres
          )
        )
      );
  }

  getSimilar(type: string = "movies", itemId: string) {
    const urlType = (() => {
      switch (type) {
        case "movies":
          return "movie";
        case "shows":
          return "tv";
        default: {
          throw new Error(`Unexpected type "${type}"`);
        }
      }
    })();

    return this.theMovieDb
      .get(`${urlType}/${itemId}/recommendations`, {
        params: this.params,
      })
      .then(({ data }) =>
        data.results.map((movie) =>
          formatMetadata(movie, type, this.imageUri, this.genres)
        )
      );
  }

  // @TODO: Properly implement provider architecture
  provide() {}
}
