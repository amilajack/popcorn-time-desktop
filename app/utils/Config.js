/**
 * Check if config file exists
 *
 * If it doesn't, create it and initialize it with the fields:
 * 'favorites', 'watchList', 'recentlyWatched'
 */
import ConfigStore from 'configstore';


export default function setupConfig() {
  return new ConfigStore('popcorn-time-experimental', {
    favorites: { items: [] },
    recentlyWatched: { items: [] },
    watchList: { items: [] },
    state: {}
  });
}

const config = setupConfig();

export function set(key: string, value) {
  return config.set(key, value);
}

export function get(key: string) {
  return config.get(key);
}

export function remove(key: string) {
  return config.delete(key);
}
