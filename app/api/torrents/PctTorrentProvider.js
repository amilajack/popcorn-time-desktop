import fetch from 'isomorphic-fetch';
import { handleProviderError } from './BaseTorrentProvider';


export default class PctTorrentProvider {

  static shows = {};

  /**
   * @todo: this should be properly cached
   *
   * Serve as a temporary cache
   * If not in cache, generate cached response
   *
   * shows = {
   *   imdbId: [
   *     torrents: <array> | array of formatted torrents
   *     season: <number>  | season to find
   *     episode: <number> | episode to find
   *   }
   * }
   * ...
   *
   * @return {array} | array of torrents
   */
  static async fetch(imdbId, type, extendedDetails) {
    const urlTypeParam = type === 'movies' ? 'movie' : 'show';
    const request = fetch(`http://api-fetch.website/tv/${urlTypeParam}/${imdbId}`)
      .then(res => res.json());

    switch (type) {
      case 'movies':
        return request.then(movie =>
          [
            { ...movie.torrents.en['1080p'], quality: '1080p' },
            { ...movie.torrents.en['720p'], quality: '720p' }
          ]
          .map(torrent => this.formatMovieTorrent(torrent))
        );
      case 'shows': {
        /**
         * @todo: Temporary cache
         */
        // if (this.shows[imdbId]) {
        //   return this.filterTorrents(this.shows[imdbId], season, episode);
        // }
        const { season, episode } = extendedDetails;

        const show = await request
          .then(res => res.episodes.map(eachEpisode => this.formatEpisode(eachEpisode)))
          .catch(error => {
            handleProviderError(error);
            return [];
          });

        this.shows[imdbId] = show;

        return this.filterTorrents(show, season, episode);
      }
      default:
        return [];
    }
  }

  /**
   * Filter torrent from episodes
   *
   * @param {array}  | Episodes
   * @param {number} | season
   * @param {number} | episode
   * @return {array} | Array of torrents
   */
  static filterTorrents(show, season, episode) {
    const filterTorrents = show
      .filter(
        eachEpisode => eachEpisode.season === season &&
                       eachEpisode.episode === episode
      )
      .map(eachEpisode => eachEpisode.torrents);

    return filterTorrents.length ? filterTorrents[0] : [];
  }

  static formatEpisode({ season, episode, torrents } = episode) {
    return {
      season,
      episode,
      torrents: this.formatTorrents(torrents)
    };
  }

  static formatMovieTorrent(torrent) {
    return {
      quality: torrent.quality,
      magnet: torrent.url,
      seeders: torrent.seed,
      leechers: 0,
      metadata: String(torrent.url),
      _provider: 'pct'
    };
  }

  static formatTorrents(torrents) {
    const formattedTorrents = [];

    for (const quality of Object.keys(torrents)) {
      const torrent = torrents[quality];

      formattedTorrents.push({
        quality: quality === '0' ? '0p' : quality,
        magnet: torrent.url,
        seeders: torrent.seeds || torrent.seed,
        leechers: torrent.peers || torrent.peer,
        _provider: 'pct'
      });
    }

    return formattedTorrents;
  }

  static provide(imdbId, type, extendedDetails = {}) {
    switch (type) {
      case 'movies':
        return this.fetch(imdbId, type, extendedDetails)
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      case 'shows':
        return this.fetch(imdbId, type, extendedDetails)
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      default:
        return [];
    }
  }
}
