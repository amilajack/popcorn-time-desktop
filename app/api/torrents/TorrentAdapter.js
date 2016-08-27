/**
 * @param   {string} imdbId
 * @param   {object} extendedDetails
 */
/* eslint global-require: 0 */
import {
  determineQuality,
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  sortTorrentsBySeeders,
  getHealth,
  resolveCache,
  setCache,
  merge
} from './BaseTorrentProvider';


const providers = [
  require('./YtsTorrentProvider'),
  require('./PbTorrentProvider'),
  require('./PctTorrentProvider'),
  require('./KatTorrentProvider')
  // require('./KatShowsTorrentProvider')
];

export default async function TorrentAdapter(imdbId: string,
                                              type: string,
                                              extendedDetails: Object,
                                              returnAll: boolean = false,
                                              method: string = 'all',
                                              cache: boolean = true) {
  const args = JSON.stringify({ extendedDetails, returnAll, method });

  if (resolveCache(args) && cache) {
    return resolveCache(args);
  }

  const torrentPromises = providers.map(
    provider => provider.provide(imdbId, type, extendedDetails)
  );

  switch (method) {
    case 'all': {
      const providerResults = await Promise.all(torrentPromises);
      const { season, episode } = extendedDetails;

      switch (type) {
        case 'movies':
          return selectTorrents(
            appendAttributes(providerResults).map((result: Object) => ({
              ...result,
              method: 'movies'
            })),
            undefined,
            returnAll,
            args
          );
        case 'shows':
          return selectTorrents(
            appendAttributes(providerResults)
              .filter(show => !!show.metadata)
              .filter(show => filterShows(show, season, episode))
              .map(result => ({
                ...result,
                method: 'shows'
              })),
            undefined,
            returnAll,
            args
          );
        case 'season_complete':
          return selectTorrents(
            appendAttributes(providerResults)
              .filter(show => !!show.metadata)
              .filter(show => filterShowsComplete(show, season))
              .map(result => ({
                ...result,
                method: 'season_complete'
              })),
            undefined,
            returnAll,
            args
          );
        default:
          throw new Error('Invalid query method');
      }
    }
    case 'race': {
      return Promise.race(torrentPromises);
    }
    default:
      throw new Error('Invalid query method');
  }
}

/**
 * Merge results from providers
 *
 * @param  {array} providerResults
 * @return {array}
 */
function appendAttributes(providerResults: Array<Object>) {
  const formattedResults = merge(providerResults).map((result: Object) => ({
    ...result,
    health: getHealth(result.seeders || 0, result.leechers || 0),
    quality: 'quality' in result
                ? result.quality
                : determineQuality(result.magnet, result.metadata, result)
  }));

  return formattedResults;
}

export function filterShows(show: Object, season: number, episode: number) {
  return (
    show.metadata.toLowerCase().includes(
      formatSeasonEpisodeToString(
        season,
        episode
      )
    )
    &&
    show.seeders !== 0
  );
}

export function filterShowsComplete(show: Object, season: number) {
  const metadata = show.metadata.toLowerCase();

  return (
    metadata.includes(`${season} complete`) ||
    metadata.includes(`${season} [complete]`) ||
    metadata.includes(`${season} - complete`) ||
    metadata.includes(`season ${season}`) ||
    metadata.includes(`s${formatSeasonEpisodeToObject(season).season}`) &&
    !metadata.includes('e0') &&
    show.seeders !== 0
  );
}

export function getStatuses() {
  return Promise
    .all(providers.map(provider => provider.getStatus()))
    .then(providerStatuses => providerStatuses.map((status, index) => ({
      providerName: providers[index].providerName,
      online: status
    })));
}

/**
 * Select one 720p and 1080p quality movie from torrent list
 * By default, sort all torrents by seeders
 *
 * @param  {array}  torrents
 * @param  {string} sortMethod
 * @param  {bool}   returnAll
 * @param  {object} key
 * @return {object}
 */
export function selectTorrents(torrents: Array<any>,
                                sortMethod: string = 'seeders',
                                returnAll: boolean = false,
                                key: string) {
  const sortedTorrents = sortTorrentsBySeeders(
    torrents
      .filter(
        (torrent: Object) => (torrent.quality !== 'n/a' && torrent.quality !== '')
      )
  );

  const formattedTorrents = returnAll
    ? sortedTorrents
    : {
      '480p': sortedTorrents.find((torrent: Object) => torrent.quality === '480p'),
      '720p': sortedTorrents.find((torrent: Object) => torrent.quality === '720p'),
      '1080p': sortedTorrents.find((torrent: Object) => torrent.quality === '1080p')
    };

  setCache(key, formattedTorrents);

  return formattedTorrents;
}
