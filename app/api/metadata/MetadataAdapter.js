/**
 * Resolve requests from cache
 */

export default function MetadataAapter() {
  const providers = [
    require('./TraktMetadataProvider')
  ];
}

/**
 * Get details about a specific movie
 *
 * @param {string} imdbId
 */
function getMovie(imdbId) {}

/**
 * Get list of movies with specific paramaters
 *
 * @param {number} page
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
function getMovies(page, limit, genre, sortBy) {}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} query
 * @param {number} limit
 * @param {string} genre
 * @param {string} sortBy
 */
function search(query, limit, genre, sortBy) {}

/**
 * Get list of movies with specific paramaters
 *
 * @param {string} imdbId
 * @param {string} type   | movie, show, anime, etc
 * @param {number} limit  | movie, show, anime, etc
 */
function similar(imdbId, type, limit) {}

/**
 * Convert runtime from minutes to hours
 *
 * @param  {number} runtimeInMinutes
 * @return {object}
 */
export function convertRuntimeToHours(runtimeInMinutes) {
  const hours = Math.round(runtimeInMinutes / 60);
  const minutes = runtimeInMinutes % 60;

  return {
    full: `${hours} ${hours > 1 ? 'hours' : 'hour'} ${minutes} minutes`,
    hours,
    minutes
  };
}
