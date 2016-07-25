/**
 * @param   {string} imdbId
 * @param   {object} extendedDetails
 * @todo    Removed torrents with duplicated magnets
 */
/* eslint global-require: 0 */
import {
  determineQuality,
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  sortTorrentsBySeeders
} from './BaseTorrentProvider';


export default async function TorrentAdapter(imdbId,
                                              type,
                                              extendedDetails,
                                              returnAll = false,
                                              method = 'all') {
  const providers = [
    require('./YtsTorrentProvider'),
    require('./PbTorrentProvider'),
    require('./PctTorrentProvider'),
    require('./KatTorrentProvider')
    // require('./KatShowsTorrentProvider')
  ];

  const torrentPromises = providers.map(
    provider => provider.provide(imdbId, type, extendedDetails)
  );

  switch (method) {
    case 'all': {
      const providerResults = await Promise.all(torrentPromises);
      const { season, episode } = extendedDetails;

      if (type === 'shows') {
        return selectTorrents(
          merge(providerResults)
            .filter(show => !!show.metadata)
            .filter(show => filterShows(show, season, episode)),
          undefined,
          returnAll
        );
      }

      if (type === 'season_complete') {
        return selectTorrents(
          merge(providerResults)
            .filter(show => !!show.metadata)
            .filter(show => filterShowsComplete(show, season)),
          undefined,
          returnAll
        );
      }

      return selectTorrents(merge(providerResults), undefined, returnAll);
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
 * @todo   Do this functionally (with map, filter, etc)
 * @param  {array} providerResults
 * @return {array}
 */
function merge(providerResults) {
  const mergedResults = [];

  for (const results of providerResults) {
    for (const result of results) {
      mergedResults.push(result);
    }
  }

  const formattedResults = mergedResults.map(result => (
    'quality' in result
      ? result
      : { ...result, quality: determineQuality(result.magnet, result.metadata, result) })
  );

  return formattedResults;
}

export function filterShows(show, season, episode) {
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

export function filterShowsComplete(show, season) {
  const metadata = show.metadata.toLowerCase();

  return (
    metadata.includes(`${season} complete`) ||
    metadata.includes(`season ${season}`) ||
    metadata.includes(`s${formatSeasonEpisodeToObject(season).season}`) &&
    !metadata.includes('e0') &&
    show.seeders !== 0
  );
}

/**
 * Select one 720p and 1080p quality movie from torrent list
 * By default, sort all torrents by seeders
 *
 * @param  {array}  torrents
 * @param  {string} sortMethod
 * @param  {bool}   returnAll
 * @return {object}
 */
export function selectTorrents(torrents, sortMethod = 'seeders', returnAll = false) {
  const sortedTorrents = sortTorrentsBySeeders(
    torrents
      .filter(
        torrent => (torrent.quality !== 'n/a' && torrent.quality !== '')
      )
  );

  if (returnAll) {
    return sortedTorrents;
  }

  return {
    '480p': sortedTorrents.find(torrent => torrent.quality === '480p'),
    '720p': sortedTorrents.find(torrent => torrent.quality === '720p'),
    '1080p': sortedTorrents.find(torrent => torrent.quality === '1080p')
  };
}
