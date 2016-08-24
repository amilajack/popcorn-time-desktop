/**
 * The highest level abstraction layer for querying torrents and metadata
 */

import TorrentAdapter from './torrents/TorrentAdapter';
import MetadataAdapter from './metadata/MetadataAdapter';


export default class Butter {

  getMovies(page = 1, limit = 50) {
    return MetadataAdapter.getMovies(page, limit);
  }

  getMovie(imdbId) {
    return MetadataAdapter.getMovie(imdbId);
  }

  getShows(page = 1, limit = 50) {
    return MetadataAdapter.getShows(page, limit);
  }

  getShow(imdbId) {
    return MetadataAdapter.getShow(imdbId);
  }

  getSeasons(imdbId) {
    return MetadataAdapter.getSeasons(imdbId);
  }

  getSeason(imdbId, season) {
    return MetadataAdapter.getSeason(imdbId, season);
  }

  getEpisode(imdbId, season, episode) {
    return MetadataAdapter.getEpisode(imdbId, season, episode);
  }

  getSimilar(type = 'movies', imdbId) {
    return MetadataAdapter.getSimilar(type, imdbId, 5);
  }

  /**
   * @param {string}  imdbId
   * @param {string}  type            | Type of torrent: movie or show
   * @param {object}  extendedDetails | Additional details provided for heuristics
   * @param {boolean} returnAll
   */
  getTorrent(imdbId, type, extendedDetails = {}, returnAll) {
    return TorrentAdapter(imdbId, type, extendedDetails, returnAll);
  }

  search(query, page = 1) {
    return MetadataAdapter.search(query, page);
  }

  getSubtitles(imdbId, filename, length, metadata) {
    return MetadataAdapter.getSubtitles(imdbId, filename, length, metadata);
  }
}
