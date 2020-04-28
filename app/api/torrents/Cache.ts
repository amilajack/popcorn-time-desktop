import { remote } from "electron";
import LruCache from "lru-cache";
import { Item } from "../metadata/MetadataProviderInterface";
import { Torrent, TorrentSelection } from "./TorrentProviderInterface";
import Config from "../../utils/Config";

export type PctCacheValue = Item | Item[] | Torrent | TorrentSelection;
export type PctCache = Cache<string, PctCacheValue>;

export default class Cache<K, V> extends LruCache<K, V> {
  constructor() {
    // CONFIG_CACHE_TIMEOUT is given as hours
    const maxAge = process.env.CONFIG_CACHE_TIMEOUT
      ? parseInt(process.env.CONFIG_CACHE_TIMEOUT, 10) * 1_000 * 60 * 60
      : 1_000 * 60 * 60;

    super({
      maxAge,
    });

    this.load(Config.get("cache") || []);

    remote.getCurrentWindow().on("close", () => {
      this.write();
    });
  }

  /**
   * Write the cache to the user's config
   */
  write() {
    if (process.env.NODE_ENV === "development") {
      console.log("Setting cache config");
    }
    Config.set("cache", this.dump());
  }

  set(key: K, value: V): boolean {
    if (process.env.NODE_ENV === "development") {
      console.log(`Setting cache key: ${JSON.stringify({ key, value })}`);
    }
    return super.set(key, value);
  }

  get(key: K): V | undefined {
    const value = super.get(key);
    if (process.env.NODE_ENV === "development" && value) {
      console.log(`Getting cache value: ${JSON.stringify({ key, value })}`);
    }
    return super.get(key);
  }
}
