/* eslint class-methods-use-this: off */
import os from "os";
import yifysubtitles from "@amilajack/yifysubtitles";
import Config from "../../utils/Config";
import { Item, UserList } from "./MetadataProviderInterface";
import { Subtitle } from "./Subtitle";

type ConfigKind = "favorites" | "recentlyWatched" | "watchList";

export function userListsHelper(listName: ConfigKind): UserList {
  return {
    async add(item: Item): Promise<void> {
      const items: Item[] = Config.get<Item[]>(listName) || [];
      const newItems = [...items, item];
      Config.set(listName, newItems);
    },
    async remove(item: Item) {
      const items: Item[] = Config.get<Item[]>(listName) || [];
      if (!item?.id) throw new Error("id not passed");
      const newItems = items.filter((_item) => _item.id !== item.id);
      Config.set(listName, newItems);
    },
    async get() {
      const items: Item[] = Config.get<Item[]>(listName) || [];
      return items;
    },
    async has(item: Item): Promise<boolean> {
      const items: Item[] = Config.get<Item[]>(listName);
      return items.some(
        (_item) => _item.ids.tmdbId === item.id || _item.ids.imdbId === item.id
      );
    },
    async clear() {
      Config.set(listName, []);
    },
  };
}

export default class BaseMetadataProvider {
  favorites = userListsHelper("favorites");

  recentlyWatched = userListsHelper("recentlyWatched");

  watchList = userListsHelper("watchList");

  /**
   * 1. Retrieve list of subtitles
   * 2. If the torrent has subtitles, get the subtitle buffer
   * 3. Convert the buffer (srt) to vtt, save the file to a tmp dir
   * 4. Serve the file through http
   * 5. Override the default subtitle retrieved from the API
   */
  async getSubtitles(
    item: Item,
    langs: string[] = ["en"],
    port: number
  ): Promise<Subtitle[]> {
    const itemId = item.ids.imdbId || item.id;
    if (!itemId) throw new Error("itemId not set");

    const subtitles = await yifysubtitles(itemId, {
      path: os.tmpdir(),
      langs,
    });

    return subtitles.map((subtitle) => ({
      ...subtitle,
      default: subtitle.langShort === process.env.DEFAULT_TORRENT_LANG,
      language: subtitle.langShort,
      basePath: `http://localhost:${port}`,
      port,
      filename: subtitle.fileName,
      fullPath: `http://localhost:${port}/${subtitle.fileName}`,
    }));
  }
}
