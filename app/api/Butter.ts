/**
 * The highest level abstraction layer for querying torrents and metadata
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

  getMovies(page = 1, limit = 50) {
    return getMovies(page, limit);
  }

  getMovie(itemId: string) {
    return getMovie(itemId);
  }

  getShows(page = 1, limit = 50) {
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

  getSimilar(type = "movies", itemId: string) {
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
    returnAll = false
  ) {
    return TorrentAdapter(itemId, type, extendedDetails, returnAll);
  }

  search(query: string, page = 1) {
    return search(query, page);
  }

  getSubtitles(
    itemId: string,
    filename: string,
    length: number,
    metadata: Record<string, any>
  ) {
    return getSubtitles(itemId, filename, length, metadata);
  }

  favorites(method: string, metadata?: Record<string, any>) {
    return favorites(method, metadata);
  }

  recentlyWatched(method: string, metadata: Record<string, any>) {
    return recentlyWatched(method, metadata);
  }

  watchList(method: string, metadata?: Record<string, any>) {
    return watchList(method, metadata);
  }
}
