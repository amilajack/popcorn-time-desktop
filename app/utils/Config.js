/**
 * Check if config file exists
 * @flow
 *
 * If it doesn't, create it and initialize it with the fields:
 * 'favorites', 'watchList', 'recentlyWatched'
 */
import ConfigStore from 'configstore';

export default function setupConfig() {
  return new ConfigStore('popcorn-time-experimental', {
    favorites: [],
    recentlyWatched: [],
    watchList: [],
    state: {}
  });
}

const config = setupConfig();

export function set(key: string, value: any) {
  return config.set(key, value);
}

export function get(key: string) {
  return config.get(key);
}

export function remove(key: string) {
  return config.delete(key);
}

export function clear() {
  return config.clear();
}
