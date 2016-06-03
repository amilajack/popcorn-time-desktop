import { merge } from '../torrents/TorrentAdapter';


export default async function SearchAdapter(query, extended = {}, method = 'race') {
  const providers = [
    require('./OmdbSearchProvider'),
    // require('./TraktSearchProvider')
  ];

  providers.map(provider => provider.provide(query));

  return Promise.race(providers);
}

function orderResults(results = [], orderBy = 'popularity', sortBy = 'desc') {
  return results.sort((prev, next) => {
    if (prev.seeders === next.seeders) {
      return 0;
    }

    return prev.seeders > next.seeders ? -1 : 1;
  });
}

function removeDuplicates(results) {
  return results.filter(
    (result, index) => results.indexOf(result) === index
  );
}

/**
 * @todo: cascade 'all' method
 *
 * @param {string} method | 'race', 'all'
 */
function cascade(providersPromisesArray = [], method = 'race') {
  switch (method) {
    case 'race':
      return Promise.race(providersPromisesArray);
    case 'all':
      return Promise.all(providersPromisesArray)
        .then(res => removeDuplicates(orderResults(merge(res))));
    default:
      throw new Error('Unsupported cascade method');
  }
}
