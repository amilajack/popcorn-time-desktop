// @flow
import rbg from 'torrentapi-wrapper';
import type { TorrentProviderInterface, torrentQueryType } from './TorrentProviderInterface';
import {
  formatSeasonEpisodeToString,
  constructSeasonQueries,
  constructMovieQueries,
  handleProviderError,
  determineQuality,
  resolveEndpoint
} from './BaseTorrentProvider';

export default class RarbgTorrentProvider implements TorrentProviderInterface {
  static providerName = 'rbg';

  static provide(itemId: string, type: string) {
    const { searchQuery } = extendedDetails;

    switch (type) {
      case 'movies':
        return (
          timeout(
            Promise.all(
              constructMovieQueries(searchQuery, itemId).map(query =>
                this.fetch(query)
              )
            )
          )
            // Flatten array of arrays to an array with no empty arrays
            .then(res => merge(res).filter(array => array.length !== 0))
            .catch(error => {
              handleProviderError(error);
              return [];
            })
        );
      case 'shows': {
        const { season, episode } = extendedDetails;

        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        ).catch(error => {
          handleProviderError(error);
          return [];
        });
      }
      case 'season_complete': {
        const { season } = extendedDetails;
        const queries = constructSeasonQueries(searchQuery, season);

        return timeout(Promise.all(queries.map(query => this.fetch(query))))
          .then(res =>
            res.reduce(
              (previous, current) =>
                previous.length && current.length
                  ? [...previous, ...current]
                  : previous.length && !current.length ? previous : current
            )
          )
          .catch(error => {
            handleProviderError(error);
            return [];
          });
      }
      default:
        return [];
    }
  }

  searchEpisode(item, season: string, episode: string, retry: boolean = false) {
    return rbg
      .search({
        query: formatShowToSearchQuery(item.title, season, episode),
        category: 'TV',
        sort: 'seeders',
        verified: false
      })
      .then(results => {
        const bestTorrents = {};
        results
          .filter(torrent => torrent.episode_info.imdb === item.id)
          .map(torrent =>
            this.formatTorrent(
              torrent,
              determineQuality(torrent.download)
            )
          )
          .forEach((torrent: TorrentType) => {
            if (
              !bestTorrents[torrent.quality] ||
              getBestTorrent(bestTorrents[torrent.quality], torrent)
            ) {
              bestTorrents[torrent.quality] = torrent;
            }
          });

        return bestTorrents;
      });
  }

  fetch(query: string, type: torrentQueryType) {
    return rbg
      .search({
        query,
        category: ,
        sort: 'seeders',
        verified: false
      })
      .then(results => results.map(torrent => this.formatTorrent(torrent)))
      .catch(error => {
        return !retry)
          ? this.search(query, category, true);
          : resolve([]);
      });
  }

  static formatTorrent(torrent, quality) {
    return {
      url: torrent.download,
      seeds: torrent.seeders,
      peers: torrent.leechers,
      size: torrent.size,
      filesize: torrent.size,
      provider: RarbgTorrentProvider.providerName,
      health: getHealth(torrent.seeders, torrent.leechers),
      quality
    };
  }
}
