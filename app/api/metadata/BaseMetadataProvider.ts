import os from "os";
import yifysubtitles from "@amilajack/yifysubtitles";
import { set, get } from "../../utils/Config";
import { Item, UserList } from "./MetadataProviderInterface";

/* eslint class-methods-use-this: off */

type ConfigKind = "favorites" | "recentlyWatched" | "watchList";

type RawSubtitle = {
  langShort: string;
};

type Subtitle = {
  kind: "captions";
  label: string;
  srclang: string;
  src: string;
  default: boolean;
};

/**
 * Get the subtitles for a movie or show
 */

export function userListsHelper(listName: ConfigKind): UserList {
  return {
    async add(item: Item): Promise<void> {
      const items: Item[] = get<Item[]>(listName) || [];
      const newItems = [...items, item];
      set(listName, newItems);
    },
    async remove(item: Item) {
      const items: Item[] = get<Item[]>(listName) || [];
      if (!item?.id) throw new Error("id not passed");
      const newItems = items.filter((_item) => _item.id !== item.id);
      set(listName, newItems);
    },
    async get() {
      const items: Item[] = get<Item[]>(listName) || [];
      return items;
    },
    async has(item: Item): Promise<boolean> {
      const items: Item[] = get<Item[]>(listName);
      return items.some(
        (_item) => _item.ids.tmdbId === item.id || _item.ids.imdbId === item.id
      );
    },
    async clear() {
      set(listName, []);
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
  getCaptions(
    item: Item,
    langs: string[] = ["en"],
    port: number
  ): Promise<Subtitle[]> {
    return yifysubtitles(item.ids.imdbId, {
      path: os.tmpdir(),
      langs,
    })
      .then((res: RawSubtitle[]) =>
        res.map((subtitle: RawSubtitle) => ({
          // Set the default language for subtitles
          default: subtitle.langShort === process.env.DEFAULT_TORRENT_LANG,
          kind: "captions",
          label: subtitle.langShort,
          srclang: subtitle.langShort,
          src: `http://localhost:${port}/${subtitle.fileName}`,
        }))
      )
      .catch(console.log);
  }
}