/* eslint prefer-template: 0 */

export function determineQuality(magnet, metadata) {
  const lowerCaseMetadata = metadata
                              ? metadata.toLowerCase()
                              : magnet.toLowerCase();

  if (
    process.env.FLAG_ALLOW_UNVERIFIED_TORRENTS === 'true'
  ) {
    return '480p';
  }

  // Filter videos with 'rendered' subtitles
  if (
    process.env.FLAG_ALLOW_SUBTITLED_MOVIES !== 'true' &&
    hasSubtitles(lowerCaseMetadata)
  ) {
    return '480p';
  }

  // Filter non-english languages
  if (hasNonEnglishLanguage(lowerCaseMetadata)) {
    return '';
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

  // Non-native codecs
  if (lowerCaseMetadata.includes('avi')) return '720p';
  if (lowerCaseMetadata.includes('mvk')) return '720p';

  console.warn(`magnet: ${magnet}, could not be verified`);

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

export function getHealth(seeders, peers) {
  let health;
  const total = (!!seeders && !!peers) ? (seeders + peers) : seeders;

  if (total >= 100) {
    health = 'healthy';
  }

  if (total >= 50 && total < 100) {
    health = 'decent';
  }

  if (total < 50) {
    health = 'poor';
  }

  return { health };
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
