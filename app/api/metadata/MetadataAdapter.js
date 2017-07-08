/**
 * Resolve requests from cache
 * @flow
 */
import OpenSubtitles from 'opensubtitles-api';
import { merge, resolveCache, setCache } from '../torrents/BaseTorrentProvider';
import TheMovieDbMetadataProvider from './TheMovieDbMetadataProvider';
// import TraktMetadataProvider from './TraktMetadataProvider';
import type { runtimeType } from './MetadataProviderInterface';

type subtitlesType = {
  kind: 'captions',
  label: string,
  srclang: string,
  src: string,
  default: boolean
};

const subtitlesEndpoint =
  'https://popcorn-time-api-server.herokuapp.com/subtitles';

const openSubtitles = new OpenSubtitles({
  useragent: 'OSTestUserAgent',
  username: '',
  password: '',
  ssl: true
});

function MetadataAdapter() {
  return [
    // new TraktMetadataProvider(),
    new TheMovieDbMetadataProvider()
  ];
}

async function interceptAndHandleRequest(method: string, args: Array<string>) {
  const key = JSON.stringify(method) + JSON.stringify(args);

  if (resolveCache(key)) {
    return Promise.resolve(resolveCache(key));
  }

  const results = await Promise.all(
    MetadataAdapter().map(provider => provider[method].apply(provider, args)) // eslint-disable-line
  );

  const mergedResults = merge(results);
  setCache(key, mergedResults);

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
function search(...args: Array<string>) {
  return interceptAndHandleRequest('search', args);
}

/**
 * Get details about a specific movie
 *
 * @param {string} itemId
 */
function getMovie(...args: Array<string>) {
  return interceptAndHandleRequest('getMovie', args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {number} page
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
function getMovies(...args: Array<string>) {
  return interceptAndHandleRequest('getMovies', args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSimilar(...args: Array<string>) {
  return interceptAndHandleRequest('getSimilar', args);
}

/**
 * Get a specific season of a show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSeason(...args: Array<string>) {
  return interceptAndHandleRequest('getSeason', args);
}

/**
 * Get a list of seasons of a show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSeasons(...args: Array<string>) {
  return interceptAndHandleRequest('getSeasons', args);
}

/**
 * Get a single episode of a season
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getEpisode(...args: Array<string>) {
  return interceptAndHandleRequest('getEpisode', args);
}

/**
 * Get a single show
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getShow(...args: Array<string>) {
  return interceptAndHandleRequest('getShow', args);
}

/**
 * Get a list of shows
 *
 * @param {string} itemId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getShows(...args: Array<string>) {
  return interceptAndHandleRequest('getShows', args);
}

/**
 * Get the subtitles for a movie or show
 *
 * @param {string} itemId
 * @param {string} filename
 * @param {object} metadata
 */
async function getSubtitles(
  imdbId: string,
  filename: string,
  length: number,
  metadata: { season?: number, episode?: number, activeMode?: string } = {}
): Promise<Array<subtitlesType>> {
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
        return openSubtitles.search({
          ...defaultOptions,
          ...{ season, episode }
        });
      }
      default:
        return openSubtitles.search(defaultOptions);
    }
  })();

  return subtitles.then(res =>
    Object.values(res).map(subtitle => formatSubtitle(subtitle))
  );
}

/**
 * Handle actions for favorites: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
function favorites(...args: Array<string>) {
  return interceptAndHandleRequest('favorites', args);
}

/**
 * Handle actions for watchList: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
function watchList(...args: Array<string>) {
  return interceptAndHandleRequest('watchList', args);
}

/**
 * Handle actions for recentlyWatched: addition, deletion, list all
 *
 * @param {string} method | Ex. 'set', 'get', 'remove'
 * @param {object} metadata | Required only for `set` and `remove`
 * @param {object} metadata | 'id', Required only remove
 */
function recentlyWatched(...args) {
  return interceptAndHandleRequest('recentlyWatched', args);
}

/**
 * Convert runtime from minutes to hours
 *
 * @param  {number} runtimeInMinutes
 * @return {object}
 */
export function parseRuntimeMinutesToObject(
  runtimeInMinutes: number
): runtimeType {
  const hours = runtimeInMinutes >= 60 ? Math.round(runtimeInMinutes / 60) : 0;
  const minutes = runtimeInMinutes % 60;

  return {
    full: hours > 0
      ? `${hours} ${hours > 1 ? 'hours' : 'hour'}${minutes > 0
          ? ` ${minutes} minutes`
          : ''}`
      : `${minutes} minutes`,
    hours,
    minutes
  };
}

function formatSubtitle(subtitle) {
  return {
    kind: 'captions',
    label: subtitle.langName,
    srclang: subtitle.lang,
    src: `${subtitlesEndpoint}/${encodeURIComponent(subtitle.url)}`,
    default: subtitle.lang === 'en'
  };
}

export default {
  getMovie,
  getMovies,
  getShow,
  getShows,
  getSeason,
  getSeasons,
  getEpisode,
  search,
  getSimilar,
  getSubtitles,
  favorites,
  watchList,
  recentlyWatched
};
