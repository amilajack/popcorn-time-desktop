/* eslint prefer-template: 0 */
export function determineQuality(title) {
  const lowerCaseTitle = title.toLowerCase();

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.FLAG_ALLOW_UNVERIFIED_TORRENTS === 'true'
  ) {
    return '480p';
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.FLAG_ALLOW_SUBTITLED_MOVIES
  ) {
    if (lowerCaseTitle.includes('subtitles')) return '720p';
  }

  // Filter videos with rendered subtitles
  if (lowerCaseTitle.includes('subtitles')) return '';

  // Filter non-english languages
  if (hasNonEnglishLanguage(title)) {
    return '';
  }

  if (lowerCaseTitle.includes('1080')) return '1080p';
  if (lowerCaseTitle.includes('bluray')) return '1080p';
  if (lowerCaseTitle.includes('blu-ray')) return '1080p';

  if (lowerCaseTitle.includes('dvd')) return '720p';
  if (lowerCaseTitle.includes('rip')) return '720p';
  if (lowerCaseTitle.includes('mp4')) return '720p';
  if (lowerCaseTitle.includes('web')) return '720p';
  if (lowerCaseTitle.includes('720')) return '720p';
  if (lowerCaseTitle.includes('hdtv')) return '720p';
  if (lowerCaseTitle.includes('english')) return '720p';
  if (lowerCaseTitle.includes('+eng+')) return '720p';

  if (lowerCaseTitle.includes('480')) return '480p';

  console.warn(`title: ${title}, could not be verified`);

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

export function hasNonEnglishLanguage(title) {
  if (title.includes('french')) return true;
  if (title.includes('german')) return true;
  if (title.includes('dutch')) return true;
  if (title.includes('spanish')) return true;
  if (title.includes('hindi')) return true;
  if (title.includes('russian')) return true;

  return false;
}
