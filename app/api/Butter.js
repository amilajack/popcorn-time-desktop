/**
 * The highest level abstraction layer for querying torrents and metadata
 *
 */
import TorrentAdapter from "./torrents/TorrentAdapter";
import {
  getTrending,
  getMovies,
  getMovie,
  getShows,
  getShow,
  getSeasons,
  getSeason,
  getEpisode,
  getSimilar,
  search,
  getSubtitles,
  favorites,
  recentlyWatched,
  watchList,
} from "./metadata/MetadataAdapter";

export default class Butter {
  getTrending() {
    return getTrending();
  }

  getMovies(page: number = 1, limit: number = 50) {
    return getMovies(page, limit);
  }

  getMovie(itemId: string) {
    return getMovie(itemId);
  }

  getShows(page: number = 1, limit: number = 50) {
    return getShows(page, limit);
  }

  getShow(itemId: string) {
    return getShow(itemId);
  }

  getSeasons(itemId: string) {
    return getSeasons(itemId);
  }

  getSeason(itemId: string, season: number) {
    return getSeason(itemId, season);
  }

  getEpisode(itemId: string, season: number, episode: number) {
    return getEpisode(itemId, season, episode);
  }

  getSimilar(type: string = "movies", itemId: string) {
    return getSimilar(type, itemId, 5);
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
    return search(query, page);
  }

  getSubtitles(
    itemId: string,
    filename: string,
    length: number,
    metadata: Object
  ) {
    return getSubtitles(itemId, filename, length, metadata);
  }

  favorites(method: string, metadata: Object) {
    return favorites(method, metadata);
  }

  recentlyWatched(method: string, metadata: Object) {
    return recentlyWatched(method, metadata);
  }

  watchList(method: string, metadata: Object) {
    return watchList(method, metadata);
  }
}
