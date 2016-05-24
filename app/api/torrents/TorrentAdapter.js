import kat from 'kat-api';


export default async function TorrentAdapter(imdbId) {
  const providers = [
    require('./KatTorrentProvider')
  ];

  const movieProviderResults = await cascade(providers.map(
    provider => provider.provide(imdbId)
  ));

  return selectTorrents(merge(movieProviderResults));
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
 *
 * @param  {array} torrents
 * @return {object}
 */
function selectTorrents(torrents) {
  console.log(torrents);
  return {
    '720p': torrents.find(torrent => torrent.quality === '720p'),
    '1080p': torrents.find(torrent => torrent.quality === '1080p')
  };
}

function cascade(providers) {
  return Promise.all(providers);
}
