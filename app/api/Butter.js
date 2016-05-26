/**
 * Method list:
 * https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods
 *
 * @todo: Find a way to get trackers or magnetURI
 * @todo: getMovies should search yts, or provider, instead of trakt.
 * 				Use trakt to fetch information about movies
 * @todo: Add caching method to resolve from cache before sending request
 */

import Trakt from 'trakt.tv';
import TorrentAdapter from './torrents/TorrentAdapter';
import MetadataAdapter, { formatMovie } from './metadata/TraktMetadataProvider';


export default class Butter {

  constructor() {
    this.metadataProvider = new MetadataAdapter();

    // @todo: Should be abstracted to MetadataProvider
    this.trakt = new Trakt({
      client_id: '52b30c468753bbcf60a4138f510b3eb655ad6d21f70b4848aa6641381ca7d003',
      client_secret: 'd395c9152654ea6ef4e0107d203b1f217cdf66ed01b6e047fa51a9e8cb93956f'
    });
  }

  getMovies(page = 1, limit = 50) {
    return this.metadataProvider.getMovies(page, limit);
  }

  /**
   * @todo: Should abstact to MetadataProvider
   */
  getMovie(imdbId) {
    return this.trakt.movies.summary({
      id: imdbId,
      extended: 'full,images,metadata'
    })
    .then(response => formatMovie(response));
  }

  getTorrent(imdbId) {
    return TorrentAdapter(imdbId); // eslint-disable-line new-cap
  }

  search(query) {
    return this.metadataProvider.search(query);
  }

  // getShows(imdbId) {}

  // getShow(imdbId) {}

  // similar(imdbId) {}
}
