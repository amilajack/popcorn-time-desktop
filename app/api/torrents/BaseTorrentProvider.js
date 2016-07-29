/* eslint prefer-template: 0 */

import cache from 'lru-cache';


export const providerCache = cache({
  maxAge: process.env.CONFIG_CACHE_TIMEOUT
            ? parseInt(process.env.CONFIG_CACHE_TIMEOUT, 10) * 1000 * 60 * 60
            : 1000 * 60 * 60 // 1 hr
});

export function determineQuality(magnet, metadata) {
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
export function formatSeasonEpisodeToString(season, episode) {
  return (
    ('s' + (String(season).length === 1 ? '0' + String(season) : String(season))) +
    ('e' + (String(episode).length === 1 ? '0' + String(episode) : String(episode)))
  );
}

/**
 * @param {number} season
 * @param {number} episode
 */
export function formatSeasonEpisodeToObject(season, episode) {
  return {
    season: (String(season).length === 1 ? '0' + String(season) : String(season)),
    episode: (String(episode).length === 1 ? '0' + String(episode) : String(episode))
  };
}

export function isExactEpisode(title, season, episode) {
  return title.toLowerCase().includes(formatSeasonEpisodeToString(season, episode));
}

export function getHealth(seeders, leechers = 0) {
  let health;
  const ratio = (seeders && !!leechers) ? (seeders / leechers) : seeders;

  if (seeders < 50) {
    health = 'poor';
    return health;
  }

  if (ratio > 1 && seeders >= 50 && seeders < 100) {
    health = 'decent';
    return health;
  }

  if (ratio > 1 && seeders >= 100) {
    health = 'healthy';
    return health;
  }

  return 'poor';
}

export function hasNonEnglishLanguage(metadata) {
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

export function hasSubtitles(metadata) {
  return metadata.includes('sub');
}

export function hasNonNativeCodec(metadata) {
  return (
    metadata.includes('avi') ||
    metadata.includes('mkv')
  );
}

export function sortTorrentsBySeeders(torrents) {
  return torrents.sort((prev, next) => {
    if (prev.seeders === next.seeders) {
      return 0;
    }

    return prev.seeders > next.seeders ? -1 : 1;
  });
}

export function constructQueries(title, season) {
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
export function merge(results) {
  return results.reduce((previous, current) => [...previous, ...current]);
}

export function getIdealTorrent(torrents) {
  const idealTorrent = torrents
    .filter(torrent => !!torrent)
    .filter(
      torrent => typeof torrent.seeders === 'number'
    );

  return !!idealTorrent
    ?
      idealTorrent.sort((prev, next) => {
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

export function resolveCache(key) {
  if (process.env.API_USE_MOCK_DATA === 'true') {
    const mock = {
      ...require('../../../test/api/metadata.mock'), // eslint-disable-line global-require
      ...require('../../../test/api/torrent.mock')   // eslint-disable-line global-require
    };

    for (const mockKey of Object.keys(mock)) {
      if (key.includes(`${mockKey}"`) && Object.keys(mock[mockKey]).length) {
        return mock[mockKey];
      }
    }

    console.warn('Fetching from network:', key);
  }

  return (
    providerCache.has(key)
      ? providerCache.get(key)
      : false
  );
}

export function setCache(key, value) {
  return providerCache.set(
    key,
    value
  );
}
