export namespace TorrentProvider {
  export type Fetch = {
    quality: string;
    magnet: string;
    seeders: number;
    leechers: number;
    metadata: string;
    _provider: string;
  };

  export type Health = "poor" | "decent" | "healthy";

  export type TorrentMethod = "all" | "race";

  export type Quality = "1080p" | "720p" | "480p" | "default";

  export type TorrentQuery = "movies" | "show" | "season_complete";

  export type Torrent = Fetch & {
    health: Health;
    quality: Quality;
    method: TorrentQuery;
  };

  export interface TorrentProviderInterface {
    supportedIdTypes: Array<"tmdb" | "imdb">;
    getStatus: () => Promise<boolean>;
    fetch: (itemId: string) => Promise<Array<Fetch>>;
    provide: (itemId: string, type: Torrent) => Promise<Array<Torrent>>;
  }
}
