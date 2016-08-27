/* eslint prefer-template: 0 */

import cache from 'lru-cache';
import URL from 'url';


export const providerCache = cache({
  maxAge: process.env.CONFIG_CACHE_TIMEOUT
            ? parseInt(process.env.CONFIG_CACHE_TIMEOUT, 10) * 1000 * 60 * 60
            : 1000 * 60 * 60 // 1 hr
});

/**
 * Handle a promise and set a timeout
 */
export function timeout(promise, time: number = 10000) {
  return new Promise((resolve, reject) => {
    promise.then(res => resolve(res));

    setTimeout(() => {
      reject(new Error('Timeout exceeded'));
    }, process.env.CONFIG_API_TIMEOUT
        ? parseInt(process.env.CONFIG_API_TIMEOUT, 10)
        : time
    );
  });
}

export function determineQuality(magnet: string, metadata: string) {
  const lowerCaseMetadata = (metadata || magnet).toLowerCase();

  if (
    process.env.FLAG_UNVERIFIED_TORRENTS === 'true'
  ) {
    return '480p';
  }

  // Filter non-english languages
  if (hasNonEnglishLanguage(lowerCaseMetadata)) {
    return '';
  }

  // Filter videos with 'rendered' subtitles
  if (hasSubtitles(lowerCaseMetadata)) {
    return process.env.FLAG_SUBTITLE_EMBEDDED_MOVIES === 'true'
            ? '480p'
            : '';
  }

  // Most accurate categorization
  if (lowerCaseMetadata.includes('1080')) return '1080p';
  if (lowerCaseMetadata.includes('720')) return '720p';
  if (lowerCaseMetadata.includes('480')) return '480p';

  // Guess the quality 1080p
  if (lowerCaseMetadata.includes('bluray')) return '1080p';
  if (lowerCaseMetadata.includes('blu-ray')) return '1080p';

  // Guess the quality 720p, prefer english
  if (lowerCaseMetadata.includes('dvd')) return '720p';
  if (lowerCaseMetadata.includes('rip')) return '720p';
  if (lowerCaseMetadata.includes('mp4')) return '720p';
  if (lowerCaseMetadata.includes('web')) return '720p';
  if (lowerCaseMetadata.includes('hdtv')) return '720p';
  if (lowerCaseMetadata.includes('eng')) return '720p';

  if (hasNonNativeCodec(lowerCaseMetadata)) {
    return process.env.FLAG_SUPPORTED_PLAYBACK_FILTERING === 'true'
            ? '720p'
            : '';
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`${magnet}, could not be verified`);
  }

  return '';
}

/**
 * @param {number} season
 * @param {number} episode
 */
export function formatSeasonEpisodeToString(season: number, episode: number) {
  return (
    ('s' + (String(season).length === 1 ? '0' + String(season) : String(season))) +
    ('e' + (String(episode).length === 1 ? '0' + String(episode) : String(episode)))
  );
}

/**
 * @param {number} season
 * @param {number} episode
 */
export function formatSeasonEpisodeToObject(season: number, episode: number) {
  return {
    season: (String(season).length === 1 ? '0' + String(season) : String(season)),
    episode: (String(episode).length === 1 ? '0' + String(episode) : String(episode))
  };
}

export function isExactEpisode(title: string, season: number, episode: number) {
  return title.toLowerCase().includes(formatSeasonEpisodeToString(season, episode));
}

export function getHealth(seeders: number, leechers: number = 0) {
  const ratio = (seeders && !!leechers) ? (seeders / leechers) : seeders;

  if (seeders < 50) {
    return 'poor';
  }

  if (ratio > 1 && seeders >= 50 && seeders < 100) {
    return 'decent';
  }

  if (ratio > 1 && seeders >= 100) {
    return 'healthy';
  }

  return 'poor';
}

export function hasNonEnglishLanguage(metadata: string) {
  if (metadata.includes('french')) return true;
  if (metadata.includes('german')) return true;
  if (metadata.includes('greek')) return true;
  if (metadata.includes('dutch')) return true;
  if (metadata.includes('hindi')) return true;
  if (metadata.includes('português')) return true;
  if (metadata.includes('portugues')) return true;
  if (metadata.includes('spanish')) return true;
  if (metadata.includes('español')) return true;
  if (metadata.includes('espanol')) return true;
  if (metadata.includes('latino')) return true;
  if (metadata.includes('russian')) return true;
  if (metadata.includes('subtitulado')) return true;

  return false;
}

export function hasSubtitles(metadata: string) {
  return metadata.includes('sub');
}

export function hasNonNativeCodec(metadata: string) {
  return (
    metadata.includes('avi') ||
    metadata.includes('mkv')
  );
}

export function sortTorrentsBySeeders(torrents: Array<any>) {
  return torrents.sort((prev: Object, next: Object) => {
    if (prev.seeders === next.seeders) {
      return 0;
    }

    return prev.seeders > next.seeders ? -1 : 1;
  });
}

export function constructMovieQueries(title: string, imdbId: string) {
  const queries = [
    title, // default
    imdbId
  ];

  return title.includes("'")
          ? [...queries, title.replace(/'/g,'')] // eslint-disable-line
          : queries;
}

export function combineAllQueries(queries: Array<Promise>) {
  return Promise.all(
    queries.map(query => this.fetch(query))
  )
    // Flatten array of arrays to an array with no empty arrays
    .then(
      res => merge(res).filter(array => array.length !== 0)
    );
}

export function constructSeasonQueries(title: string, season: number) {
  const formattedSeasonNumber = `s${formatSeasonEpisodeToObject(season, 1).season}`;

  return [
    `${title} season ${season}`,
    `${title} season ${season} complete`,
    `${title} season ${formattedSeasonNumber} complete`
  ];
}

/**
 * @param {array} results | A two-dimentional array containing arrays of results
 */
export function merge(results: Array<any>) {
  return results.reduce((previous, current) => [...previous, ...current]);
}

export function resolveEndpoint(defaultEndpoint: string, providerId: string) {
  const endpointEnvVariable = `CONFIG_ENDPOINT_${providerId}`;

  switch (process.env[endpointEnvVariable]) {
    case undefined:
      return defaultEndpoint;
    default:
      return URL.format({
        ...URL.parse(defaultEndpoint),
        hostname: process.env[endpointEnvVariable],
        host: process.env[endpointEnvVariable]
      });
  }
}

export function getIdealTorrent(torrents: Array<>) {
  const idealTorrent = torrents
    .filter(torrent => !!torrent)
    .filter(
      (torrent: Object) => typeof torrent.seeders === 'number'
    );

  return idealTorrent
    ?
      idealTorrent.sort((prev: Object, next: Object) => {
        if (prev.seeders === next.seeders) {
          return 0;
        }

        return prev.seeders > next.seeders ? -1 : 1;
      })[0]
    :
      idealTorrent;
}

export function handleProviderError(error) {
  if (process.env.NODE_ENV === 'development') {
    console.log(error);
  }
}

export function resolveCache(key: string) {
  if (process.env.API_USE_MOCK_DATA === 'true') {
    const mock = {
      ...require('../../../test/api/metadata.mock'), // eslint-disable-line global-require
      ...require('../../../test/api/torrent.mock')   // eslint-disable-line global-require
    };

    const resolvedCacheItem = Object.keys(mock).find(
      mockKey => key.includes(`${mockKey}"`) && Object.keys(mock[mockKey]).length
    );

    if (resolvedCacheItem) {
      return resolvedCacheItem;
    }

    console.warn('Fetching from network:', key);
    return false;
  }

  return (
    providerCache.has(key)
      ? providerCache.get(key)
      : false
  );
}

export function setCache(key: string, value: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Setting cache key', key);
  }
  return providerCache.set(
    key,
    value
  );
}
