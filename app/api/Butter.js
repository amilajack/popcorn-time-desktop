/**
 * The highest level abstraction layer for querying torrents and metadata
 * @flow
 */
import TorrentAdapter from "./torrents/TorrentAdapter";
import MetadataAdapter from "./metadata/MetadataAdapter";

export default class Butter {
  getMovies(page: number = 1, limit: number = 50) {
    return MetadataAdapter.getMovies(page, limit);
  }

  getMovie(itemId: string) {
    return MetadataAdapter.getMovie(itemId);
  }

  getShows(page: number = 1, limit: number = 50) {
    return MetadataAdapter.getShows(page, limit);
  }

  getShow(itemId: string) {
    return MetadataAdapter.getShow(itemId);
  }

  getSeasons(itemId: string) {
    return MetadataAdapter.getSeasons(itemId);
  }

  getSeason(itemId: string, season: number) {
    return MetadataAdapter.getSeason(itemId, season);
  }

  getEpisode(itemId: string, season: number, episode: number) {
    return MetadataAdapter.getEpisode(itemId, season, episode);
  }

  getSimilar(type: string = "movies", itemId: string) {
    return MetadataAdapter.getSimilar(type, itemId, 5);
  }

  /**
   * @param {string}  itemId
   * @param {string}  type            | Type of torrent: movie or show
   * @param {object}  extendedDetails | Additional details provided for heuristics
   * @param {boolean} returnAll
   */
  getTorrent(
    itemId: string,
    type: string,
    extendedDetails: { [option: string]: string | number } = {},
    returnAll: boolean = false
  ) {
    return TorrentAdapter(itemId, type, extendedDetails, returnAll);
  }

  search(query: string, page: number = 1) {
    return MetadataAdapter.search(query, page);
  }

  getSubtitles(
    itemId: string,
    filename: string,
    length: number,
    metadata: Object
  ) {
    return MetadataAdapter.getSubtitles(itemId, filename, length, metadata);
  }

  favorites(method: string, metadata: Object) {
    return MetadataAdapter.favorites(method, metadata);
  }

  recentlyWatched(method: string, metadata: Object) {
    return MetadataAdapter.recentlyWatched(method, metadata);
  }

  watchList(method: string, metadata: Object) {
    return MetadataAdapter.watchList(method, metadata);
  }
}
