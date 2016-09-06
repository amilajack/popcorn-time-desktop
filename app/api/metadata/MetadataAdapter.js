/**
 * Resolve requests from cache
 */
import {
  merge,
  resolveCache,
  setCache
} from '../torrents/BaseTorrentProvider';


function MetadataAdapter() {
  const providers = [
    new (require('./TraktMetadataProvider')) // eslint-disable-line global-require
  ];

  return providers;
}

async function handleRequest(method: string, args) {
  const key = JSON.stringify(method) + JSON.stringify(args);

  if (resolveCache(key)) {
    return resolveCache(key);
  }

  const results = await Promise.all(
    MetadataAdapter()
      .map(provider => provider[method].apply(provider, args)) // eslint-disable-line
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
function search(...args) {
  return handleRequest('search', args);
}

/**
 * Get details about a specific movie
 *
 * @param {string} imdbId
 */
function getMovie(...args) {
  return handleRequest('getMovie', args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {number} page
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
function getMovies(...args) {
  return handleRequest('getMovies', args);
}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSimilar(...args) {
  return handleRequest('getSimilar', args);
}

/**
 * Get a specific season of a show
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSeason(...args) {
  return handleRequest('getSeason', args);
}

/**
 * Get a list of seasons of a show
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getSeasons(...args) {
  return handleRequest('getSeasons', args);
}

/**
 * Get a single episode of a season
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getEpisode(...args) {
  return handleRequest('getEpisode', args);
}

/**
 * Get a single show
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getShow(...args) {
  return handleRequest('getShow', args);
}

/**
 * Get a list of shows
 *
 * @param {string} imdbId
 * @param {string} type   | movie or show
 * @param {number} limit  | movie or show
 */
function getShows(...args) {
  return handleRequest('getShows', args);
}

/**
 * Get the subtitles for a movie or show
 *
 * @param {string} imdbId
 * @param {string} filename
 * @param {object} metadata
 */
function getSubtitles(...args) {
  return handleRequest('getSubtitles', args);
}

/**
 * Convert runtime from minutes to hours
 *
 * @param  {number} runtimeInMinutes
 * @return {object}
 */
export function convertRuntimeToHours(runtimeInMinutes: number) {
  const hours = runtimeInMinutes >= 60 ? Math.round(runtimeInMinutes / 60) : 0;
  const minutes = runtimeInMinutes % 60;

  return {
    full: hours > 0
            ? `${hours} ${hours > 1 ? 'hours' : 'hour'}${minutes > 0 ? ` ${minutes} minutes` : ''}`
            : `${minutes} minutes`,
    hours,
    minutes
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
  getSubtitles
};
