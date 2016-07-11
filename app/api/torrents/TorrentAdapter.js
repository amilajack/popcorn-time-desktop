/**
 * @param   {string} imdbId
 * @param   {object} extendedDetails
 */
/* eslint global-require: 0 */
export default async function TorrentAdapter(imdbId,
                                              type,
                                              extendedDetails,
                                              returnAll = false,
                                              method = 'all') {
  const providers = [
    require('./YtsTorrentProvider'),
    require('./PbTorrentProvider'),
    require('./PctTorrentProvider'),
    require('./KatTorrentProvider'),
    require('./KatShowsTorrentProvider')
  ];

  const torrentPromises = providers.map(
    provider => provider.provide(imdbId, type, extendedDetails)
  );

  switch (method) {
    case 'all': {
      const movieProviderResults = await cascade(torrentPromises);

      if (
        process.env.NODE_ENV !== 'production' &&
        process.env.FLAG_FORCE_STRICT_TORRENT_VALIDATION === 'true' &&
        type === 'shows') {
        const { formatSeasonEpisodeToString } = require('./BaseTorrentProvider');

        console.warn(
          'FLAG_FORCE_STRICT_TORRENT_VALIDATION:',
          'Strict torrent filtering enabled'
        );

        return selectTorrents(
          merge(movieProviderResults).filter(
            result => result.magnet.includes(formatSeasonEpisodeToString(
              extendedDetails.season,
              extendedDetails.episode
            ))
          ),
          undefined,
          returnAll
        );
      }

      return selectTorrents(merge(movieProviderResults), undefined, returnAll);
    }
    case 'race': {
      return Promise.race(torrentPromises);
    }
    default:
      throw new Error('Invalid type');
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

  return mergedResults;
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
function selectTorrents(torrents, sortMethod = 'seeders', returnAll = false) {
  const sortedTorrents = torrents
    .filter(
      torrent => (torrent.quality !== 'n/a' && torrent.quality !== '')
    )
    .sort((prev, next) => {
      if (prev.seeders === next.seeders) {
        return 0;
      }

      return prev.seeders > next.seeders ? -1 : 1;
    });

  if (returnAll) {
    return sortedTorrents;
  }

  return {
    '480p': sortedTorrents.find(torrent => torrent.quality === '480p'),
    '720p': sortedTorrents.find(torrent => torrent.quality === '720p'),
    '1080p': sortedTorrents.find(torrent => torrent.quality === '1080p')
  };
}

function cascade(providers) {
  return Promise.all(providers);
}
