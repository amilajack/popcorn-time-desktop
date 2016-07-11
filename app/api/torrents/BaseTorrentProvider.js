/* eslint prefer-template: 0 */
export function determineQuality(title) {
  const lowerCaseTitle = title.toLowerCase();
  if (lowerCaseTitle.includes('1080')) return '1080p';
  if (lowerCaseTitle.includes('bluray')) return '1080p';
  if (lowerCaseTitle.includes('blu-ray')) return '1080p';
  if (lowerCaseTitle.includes('dvd')) return '720p';
  if (lowerCaseTitle.includes('720')) return '720p';
  if (lowerCaseTitle.includes('hdtv')) return '720p';
  if (lowerCaseTitle.includes('480')) return '480p';

  // Filter non-english languages
  if (lowerCaseTitle.includes('french')) return '';
  if (lowerCaseTitle.includes('german')) return '';

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
