/* eslint prefer-template: 0 */
export function determineQuality(title) {
  if (title.includes('1080')) return '1080p';
  if (title.includes('720')) return '720p';
  if (title.includes('480')) return '480p';
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
