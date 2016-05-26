/**
 * Method list:
 * https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods
 *
 * @todo: Find a way to get trackers or magnetURI
 * @todo: getMovies should search yts, or provider, instead of trakt.
 * 				Use trakt to fetch information about movies
 * @todo: Add caching method to resolve from cache before sending request
 */

import TorrentAdapter from './torrents/TorrentAdapter';
import MetadataAdapter from './metadata/TraktMetadataProvider';


export default class Butter {

  constructor() {
    this.metadataProvider = new MetadataAdapter();
  }

  getMovies(page = 1, limit = 50) {
    return this.metadataProvider.getMovies(page, limit);
  }

  getMovie(imdbId) {
    return this.metadataProvider.getMovie(imdbId);
  }

  getTorrent(imdbId) {
    return TorrentAdapter(imdbId); // eslint-disable-line new-cap
  }

  // getShows(imdbId) {}

  // getShow(imdbId) {}

  // search(imdbId) {}

  // similar(imdbId) {}
}
