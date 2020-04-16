/**
 * Resolve requests from cache
 */
import OpenSubtitles from "opensubtitles-api";
import { merge, resolveCache, setCache } from "../torrents/BaseTorrentProvider";
import TheMovieDbMetadataProvider from "./TheMovieDbMetadataProvider";

type RawSubtitle = {
  langName: string;
  lang: string;
  url: string;
};

type Subtitle = {
  kind: "captions";
  label: string;
  srclang: string;
  src: string;
  default: boolean;
};

const SUBTITLES_ENDPOINT =
  "https://popcorn-time-api-server.herokuapp.com/subtitles";

const openSubtitles = new OpenSubtitles({
  useragent: "OSTestUserAgent",
  username: "",
  password: "",
  ssl: true,
});

function MetadataAdapter() {
  return [new TheMovieDbMetadataProvider()];
}

async function interceptAndHandleRequest(
  method: string,
  args: Array<string | number>,
  cache = true
) {
  const key = JSON.stringify(method) + JSON.stringify(args);

  if (cache && resolveCache(key)) {
    return Promise.resolve(resolveCache(key));
  }

  const results = await Promise.all(
    MetadataAdapter().map(provider => provider[method].apply(provider, args)) // eslint-disable-line
  );

  const mergedResults = merge(results);

  if (cache) {
    setCache(key, mergedResults);
  }

  return mergedResults;
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} query
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
export function search(...args: Array<string | number>) {
  return interceptAndHandleRequest("search", args);
}

/**
 * Get details about a specific movie
 *
 * @param {string} itemId
 */
export function getMovie(...args: Array<string | number>) {
  return interceptAndHandleRequest("getMovie", args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {number} page
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
export function getMovies(...args: Array<string | number>) {
  return interceptAndHandleRequest("getMovies", args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getSimilar(...args: Array<string | number>) {
  return interceptAndHandleRequest("getSimilar", args);
}

/**
 * Get a specific season of a show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getSeason(...args: Array<string | number>) {
  return interceptAndHandleRequest("getSeason", args);
}

/**
 * Get a list of seasons of a show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getSeasons(...args: Array<string | number>) {
  return interceptAndHandleRequest("getSeasons", args);
}

/**
 * Get a single episode of a season
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getEpisode(...args: Array<string | number>) {
  return interceptAndHandleRequest("getEpisode", args);
}

/**
 * Get a single show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getShow(...args: Array<string | number>) {
  return interceptAndHandleRequest("getShow", args);
}

/**
 * Get a list of shows
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
export function getShows(...args: Array<string | number>) {
  return interceptAndHandleRequest("getShows", args);
}

/**
 * Get trending movies and shows
 */
export function getTrending() {
  return Promise.all(
    MetadataAdapter().map((provider) => provider.getTrending())
  ).then((res) => res.flat());
}

export function formatSubtitle(subtitle: RawSubtitle): Subtitle {
  return {
    kind: "captions",
    label: subtitle.langName,
    srclang: subtitle.lang,
    src: `${SUBTITLES_ENDPOINT}/${encodeURIComponent(subtitle.url)}`,
    default: subtitle.lang === "en",
  };
}

/**
 * Get the subtitles for a movie or show
 *
 * @param {string} itemId
 * @param {string} filename
 * @param {object} metadata
 */
export async function getSubtitles(
  imdbId: string,
  filename: string,
  length: number,
  metadata: { season?: number; episode?: number; activeMode?: string } = {}
): Promise<Array<Subtitle>> {
  const { activeMode } = metadata;

  const defaultOptions = {
    sublanguageid: "eng",
    // sublanguageid: 'all', // @TODO
    // hash: '8e245d9679d31e12', // @TODO
    filesize: length || undefined, // @TODO remove these `undefined` values
    filename: filename || undefined,
    season: metadata.season || undefined,
    episode: metadata.episode || undefined,
    extensions: ["srt", "vtt"],
    imdbid: imdbId,
  };

  const subtitles: RawSubtitle[] = await (() => {
    switch (activeMode) {
      case "shows": {
        const { season, episode } = metadata;
        return openSubtitles.search({
          ...defaultOptions,
          ...{ season, episode },
        });
      }
      default:
        return openSubtitles.search(defaultOptions);
    }
  })();

  return Object.values(subtitles).map((subtitle) => formatSubtitle(subtitle));
}

/**
 * Handle actions for favorites: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
export function favorites(...args: Array<string | number>) {
  return interceptAndHandleRequest("favorites", args, false);
}

/**
 * Handle actions for watchList: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
export function watchList(...args: Array<string | number>) {
  return interceptAndHandleRequest("watchList", args, false);
}

/**
 * Handle actions for recentlyWatched: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
export function recentlyWatched(...args) {
  return interceptAndHandleRequest("recentlyWatched", args, false);
}
