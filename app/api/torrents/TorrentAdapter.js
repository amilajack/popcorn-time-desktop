/**
 * @param   {string} imdbId
 * @param   {object} extendedDetails
 * @example { searchQuery: 'harry potter', ... }
 */
export default async function TorrentAdapter(imdbId, extendedDetails, returnAll = false) {
  const providers = [
    require('./YtsTorrentProvider'),
    require('./PbTorrentProvider'),
    require('./KatTorrentProvider')
  ];

  const movieProviderResults = await cascade(providers.map(
    provider => provider.provide(imdbId, extendedDetails)
  ));

  return selectTorrents(merge(movieProviderResults), undefined, returnAll);
}

/**
 * Retrieve providers and set as property on class
 *
 * @todo  mount provider paths from .env
 * @param TorrentProvidersArray
 */
function mount(TorrentProvidersArray) {
  const providers = TorrentProvidersArray;
  return providers;
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
    .filter(torrent => torrent.quality !== 'n/a')
    .filter(torrent => torrent.quality !== '')
    .sort((prev, next) => {
      if (prev.seeders === next.seeders) {
        return 0;
      }

      return prev.seeders > next.seeders ? -1 : 1;
    });

  console.log(sortedTorrents);
  console.log(sortedTorrents.length);

  if (returnAll) {
    return sortedTorrents;
  }

  return {
    '720p': sortedTorrents.find(torrent => torrent.quality === '720p'),
    '1080p': sortedTorrents.find(torrent => torrent.quality === '1080p')
  };
}

function cascade(providers) {
  return Promise.all(providers);
}
