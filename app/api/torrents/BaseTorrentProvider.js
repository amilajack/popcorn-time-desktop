export function determineQuality(title) {
  if (title.includes('720')) {
    return '720p';
  }
  if (title.includes('1080')) {
    return '1080p';
  }
  return '';
}
