import { set, get } from "../../utils/Config";
import { Content, Method } from "./MetadataProviderInterface";

type Config = "favorites" | "recentlyWatched" | "watchList";

export default class BaseMetadataProvider {
  /**
   * Temporarily store the 'favorites', 'recentlyWatched', 'watchList' items
   * in config file. The cache can't be used because this data needs to be
   * persisted.
   *
   * @private
   */
  updateConfig(type: Config, method: Method, metadata: Content) {
    const property = String(type);

    switch (method) {
      case "set":
        set(property, [...(get(property) || []), metadata]);
        return get(property);
      case "get":
        return get(property);
      case "remove": {
        const items = [
          ...(get(property) || []).filter((item) => item.id !== metadata.id),
        ];
        return set(property, items);
      }
      default:
        return set(property, [...(get(property) || []), metadata]);
    }
  }

  favorites(...args: Array<any>) {
    return this.updateConfig("favorites", ...args);
  }

  recentlyWatched(...args: Array<any>) {
    return this.updateConfig("recentlyWatched", ...args);
  }

  watchList(...args: Array<any>) {
    return this.updateConfig("watchList", ...args);
  }
}
