import ConfigStore from "configstore";

export default class Config {
  static config = new ConfigStore(
    process.env.E2E_BUILD === "true" || process.env.TEST === "true"
      ? "popcorn-time-test"
      : "popcorn-time",
    {
      favorites: [],
      recentlyWatched: [],
      watchList: [],
      state: {},
      cache: [],
      settings: {},
    }
  );

  static set<T = any>(key: string, value: T) {
    return this.config.set(key, value);
  }

  static get<T>(key: string): T {
    return this.config.get(key);
  }

  static remove(key: string) {
    return this.config.delete(key);
  }

  static clear() {
    return this.config.clear();
  }
}
