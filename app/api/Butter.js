/**
 * The highest level abstraction layer for querying torrents and metadata
 *
 * @todo: Add caching method to resolve from cache before sending request
 */

import TorrentAdapter from './torrents/TorrentAdapter';
import MetadataAdapter from './metadata/TraktMetadataProvider';
import SearchAdapter from './search/SearchAdapter';

export default class Butter {

  constructor() {
    this.metadataAdapter = new MetadataAdapter();
  }

  getMovies(page = 1, limit = 50) {
    return this.metadataAdapter.getMovies(page, limit);
  }

  /**
   * @todo: Should abstact to MetadataProvider
   */
  getMovie(imdbId) {
    return this.metadataAdapter.getMovie(imdbId);
  }

  getTorrent(imdbId, extendedDetails = {}, returnAll) {
    return TorrentAdapter(imdbId, extendedDetails, returnAll); // eslint-disable-line new-cap
  }

  search(imdbId, query, extended = {}) {
    return SearchAdapter(imdbId, query, extended); // eslint-disable-line new-cap
  }

  getSimilarMovies(imdbId) {
    return this.metadataAdapter.similar('movie', imdbId, 5);
  }

  // getShows(imdbId) {}

  // getShow(imdbId) {}

  // getSimilarShows(imdbId) {}
}
