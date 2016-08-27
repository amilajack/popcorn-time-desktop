import fetch from 'isomorphic-fetch';
import {
  handleProviderError,
  timeout,
  resolveEndpoint
} from './BaseTorrentProvider';


const endpoint = 'http://api-fetch.website/tv';
const providerId = 'PCT';
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

export default class PctTorrentProvider {

  static providerName = 'PopcornTime API';

  static shows = {};

  static async fetch(imdbId: string, type: string, extendedDetails: Object) {
    const urlTypeParam = type === 'movies' ? 'movie' : 'show';
    const request = timeout(
      fetch(`${resolvedEndpoint}/${urlTypeParam}/${imdbId}`)
        .then(res => res.json())
    );

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
  static filterTorrents(show: Array<any>, season: number, episode: number) {
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

  static formatMovieTorrent(torrent: Object) {
    return {
      quality: torrent.quality,
      magnet: torrent.url,
      seeders: torrent.seed,
      leechers: 0,
      metadata: String(torrent.url),
      _provider: 'pct'
    };
  }

  static formatTorrents(torrents: Object) {
    return Object.keys(torrents).map(videoQuality => ({
      quality: videoQuality === '0' ? '0p' : videoQuality,
      magnet: torrents[videoQuality].url,
      seeders: torrents[videoQuality].seeds || torrents[videoQuality].seed,
      leechers: torrents[videoQuality].peers || torrents[videoQuality].peer,
      _provider: 'pct'
    }));
  }

  static getStatus() {
    return fetch(resolvedEndpoint).then(res => res.ok).catch(() => false);
  }

  static provide(imdbId: string, type: string, extendedDetails: Object = {}) {
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
