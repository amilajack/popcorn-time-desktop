import { ItemKind } from "../metadata/MetadataProviderInterface";

enum _TorrentKind {
  SeasonComplete = "season_complete",
}

export type TorrentKind = _TorrentKind | ItemKind;

export type Health = "poor" | "decent" | "healthy";

export type TorrentMethod = "all" | "race";

export type Quality = "1080p" | "720p" | "480p";

export type TorrentQuery = ItemKind | "season_complete";

export type ProviderTorrent = {
  quality: string;
  magnet: string;
  seeders: number;
  leechers: number;
  metadata: string;
  _provider: string;
};

export type SearchDetail = {
  season: number;
  episode: number;
};

export type ShowDetail = {
  season: number;
  episode: number;
};

export type ExtendedDetails = ShowDetail | SearchDetail | {};

export type Torrent = ProviderTorrent & {
  health: Health;
  quality: Quality;
  kind: TorrentQuery;
};

export type TorrentSelection = Record<Quality, Torrent | undefined>;

export abstract class TorrentProviderInterface {
  static providerName: string;

  static supportedIdTypes: Array<"tmdb" | "imdb">;

  static getStatus: () => Promise<boolean>;

  static fetch: <T = ProviderTorrent[]>(
    itemId: string,
    extendedDetails?: ExtendedDetails
  ) => Promise<T>;

  static provide: (
    itemId: string,
    type: ItemKind
  ) => Promise<Array<ProviderTorrent>>;
}
