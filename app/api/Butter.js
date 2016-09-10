/**
 * The highest level abstraction layer for querying torrents and metadata
 */
import TorrentAdapter from './torrents/TorrentAdapter';
import MetadataAdapter from './metadata/MetadataAdapter';


export default class Butter {

  getMovies(page: number = 1, limit: number = 50) {
    return MetadataAdapter.getMovies(page, limit);
  }

  getMovie(imdbId: string) {
    return MetadataAdapter.getMovie(imdbId);
  }

  getShows(page: number = 1, limit: number = 50) {
    return MetadataAdapter.getShows(page, limit);
  }

  getShow(imdbId: string) {
    return MetadataAdapter.getShow(imdbId);
  }

  getSeasons(imdbId: string) {
    return MetadataAdapter.getSeasons(imdbId);
  }

  getSeason(imdbId: string, season: number) {
    return MetadataAdapter.getSeason(imdbId, season);
  }

  getEpisode(imdbId: string, season: number, episode: number) {
    return MetadataAdapter.getEpisode(imdbId, season, episode);
  }

  getSimilar(type: string = 'movies', imdbId: string) {
    return MetadataAdapter.getSimilar(type, imdbId, 5);
  }

  /**
   * @param {string}  imdbId
   * @param {string}  type            | Type of torrent: movie or show
   * @param {object}  extendedDetails | Additional details provided for heuristics
   * @param {boolean} returnAll
   */
  getTorrent(imdbId: string,
              type: string,
              extendedDetails: Object = {},
              returnAll: boolean = false) {
    return TorrentAdapter(imdbId, type, extendedDetails, returnAll);
  }

  search(query: string, page: number = 1) {
    return MetadataAdapter.search(query, page);
  }

  getSubtitles(imdbId: string, filename: string, length: number, metadata: Object) {
    return MetadataAdapter.getSubtitles(imdbId, filename, length, metadata);
  }
}
