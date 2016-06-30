/* eslint prefer-template: 0 */
export function determineQuality(title) {
  if (title.includes('720')) {
    return '720p';
  }
  if (title.includes('1080')) {
    return '1080p';
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

export function getHealth(seeders, peers) {
  let health;

  if (seeders + peers >= 100) {
    health = 'healthy';
  }

  if (seeders + peers >= 50 && seeders + peers < 100) {
    health = 'decent';
  }

  if (seeders + peers < 50) {
    health = 'poor';
  }

  return { health };
}
