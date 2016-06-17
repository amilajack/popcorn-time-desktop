export function determineQuality(title) {
  if (title.includes('720')) {
    return '720p';
  }
  if (title.includes('1080')) {
    return '1080p';
  }
  return '';
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
