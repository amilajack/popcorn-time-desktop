import OpenSubtitles from "opensubtitles-api";
import { set, get } from "../../utils/Config";
import { Item, UserList } from "./MetadataProviderInterface";

/* eslint class-methods-use-this: off */

type ConfigKind = "favorites" | "recentlyWatched" | "watchList";

type RawSubtitle = {
  langName: string;
  lang: string;
  url: string;
};

type Subtitle = {
  kind: "captions";
  label: string;
  srclang: string;
  src: string;
  default: boolean;
};

const SUBTITLES_ENDPOINT =
  "https://popcorn-time-api-server.herokuapp.com/subtitles";

const openSubtitles = new OpenSubtitles({
  useragent: "OSTestUserAgent",
  username: "",
  password: "",
  ssl: true,
});

export function formatSubtitle(subtitle: RawSubtitle): Subtitle {
  return {
    kind: "captions",
    label: subtitle.langName,
    srclang: subtitle.lang,
    src: `${SUBTITLES_ENDPOINT}/${encodeURIComponent(subtitle.url)}`,
    default: subtitle.lang === "en",
  };
}

/**
 * Get the subtitles for a movie or show
 */

function userListsHelper(listName: ConfigKind): UserList {
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
    async clear() {
      set(listName, []);
    },
  };
}

export default class BaseMetadataProvider {
  favorites = userListsHelper("favorites");

  recentlyAdded = userListsHelper("recentlyWatched");

  watchList = userListsHelper("watchList");

  async getSubtitles(
    imdbId: string,
    filename: string,
    length: number,
    metadata: { season?: number; episode?: number; activeMode?: string } = {}
  ): Promise<Array<Subtitle>> {
    const { activeMode } = metadata;

    const defaultOptions = {
      sublanguageid: "eng",
      // sublanguageid: 'all', // @TODO
      // hash: '8e245d9679d31e12', // @TODO
      filesize: length || undefined, // @TODO remove these `undefined` values
      filename: filename || undefined,
      season: metadata.season || undefined,
      episode: metadata.episode || undefined,
      extensions: ["srt", "vtt"],
      imdbid: imdbId,
    };

    const subtitles: RawSubtitle[] = await (() => {
      switch (activeMode) {
        case "shows": {
          const { season, episode } = metadata;
          return openSubtitles.search({
            ...defaultOptions,
            ...{ season, episode },
          });
        }
        default:
          return openSubtitles.search(defaultOptions);
      }
    })();

    return Object.values(subtitles).map((subtitle) => formatSubtitle(subtitle));
  }
}
