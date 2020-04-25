import ConfigStore from "configstore";

export default function setupConfig() {
  return new ConfigStore(
    process.env.E2E_BUILD === "true" ? "popcorn-time-test" : "popcorn-time",
    {
      favorites: [],
      recentlyWatched: [],
      watchList: [],
      state: {},
      cache: [],
    }
  );
}

const config = setupConfig();

export function set<T = any>(key: string, value: T) {
  return config.set(key, value);
}

export function get<T>(key: string): T {
  return config.get(key);
}

export function remove(key: string) {
  return config.delete(key);
}

export function clear() {
  return config.clear();
}
