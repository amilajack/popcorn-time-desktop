import fetch from "node-fetch";
import {
  handleProviderError,
  timeout,
  resolveEndpoint,
} from "./BaseTorrentProvider";
import {
  TorrentProviderInterface,
  ProviderTorrent,
  ExtendedDetails,
  ShowDetail,
} from "./TorrentProviderInterface";
import { ItemKind } from "../metadata/MetadataProviderInterface";

const endpoint = "https://tv-v2.api-fetch.website";
const providerId = "PCT";
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

type RawTorrent = {
  quality: string;
  url: string;
  seed?: number;
  seeds?: number;
  seeders?: number;
  peer?: number;
  season?: number;
  episode?: number;
};

type RawEpisode = {
  season: number;
  episode: number;
  torrents: RawTorrent[];
};

type RawMovieTorrent = {
  torrents: {
    en: {
      "1080p": RawTorrent;
      "720p": RawTorrent;
    };
  };
};

type RawEpisodeTorrent = {
  episodes: RawEpisode[];
};

export default class PctTorrentProvider extends TorrentProviderInterface {
  static providerName = "PopcornTime";

  static async fetch(
    itemId: string,
    type: ItemKind,
    extendedDetails: ExtendedDetails = {}
  ): Promise<ProviderTorrent[]> {
    const urlTypeParam = type === ItemKind.Movie ? "movie" : "show";
    const request = timeout<RawMovieTorrent | RawEpisodeTorrent>(
      fetch(`${resolvedEndpoint}/${urlTypeParam}/${itemId}`).then((res) =>
        res.json()
      )
    );

    switch (type) {
      case ItemKind.Movie: {
        const movieTorrent = (await request) as RawMovieTorrent;
        return [
          { ...movieTorrent.torrents.en["1080p"], quality: "1080p" },
          { ...movieTorrent.torrents.en["720p"], quality: "720p" },
        ].map((torrent) => this.formatMovieTorrent(torrent));
      }
      case ItemKind.Show: {
        const { season, episode } = extendedDetails as ShowDetail;
        try {
          const show = (await request) as RawEpisodeTorrent;
          const episodes = show.episodes
            .map((eachEpisode) => this.formatEpisodeTorrent(eachEpisode))
            .filter(
              (eachEpisode) =>
                String(eachEpisode.season) === String(season) &&
                String(eachEpisode.episode) === String(episode)
            )
            .map((eachEpisode) => eachEpisode.torrents);
          return episodes.length > 0 ? episodes[0] : [];
        } catch (error) {
          handleProviderError(error);
          return [];
        }
      }
      default:
        return [];
    }
  }

  static formatEpisodeTorrent({ season, episode, torrents }: RawEpisode) {
    return {
      season,
      episode,
      torrents: this.formatEpisodeTorrents(torrents),
    };
  }

  static formatMovieTorrent(torrent: RawTorrent): ProviderTorrent {
    return {
      quality: torrent.quality,
      magnet: torrent.url,
      seeders: torrent.seed || torrent.seeds || 0,
      leechers: torrent.peer || 0,
      metadata: String(torrent.url),
      _provider: "pct",
    };
  }

  static formatEpisodeTorrents(torrents: RawTorrent[]): ProviderTorrent[] {
    return Object.entries(torrents).map(([videoQuality, video]) => ({
      quality: videoQuality === "0" ? "0p" : videoQuality,
      magnet: video?.url,
      metadata: String(video?.url),
      seeders: video?.seeds || video?.seed || video?.seeders || 0,
      leechers: video?.peer || 0,
      _provider: "pct",
    }));
  }

  static getStatus() {
    return fetch(resolvedEndpoint)
      .then((res) => res.ok)
      .catch(() => false);
  }

  static provide(
    itemId: string,
    type: ItemKind,
    extendedDetails: ShowDetail
  ): Promise<ProviderTorrent[]> {
    switch (type) {
      case ItemKind.Movie:
        return this.fetch(itemId, type, extendedDetails).catch((error) => {
          handleProviderError(error);
          return [];
        });
      case ItemKind.Show:
        return this.fetch(itemId, type, extendedDetails).catch((error) => {
          handleProviderError(error);
          return [];
        });
      default:
        return Promise.resolve([]);
    }
  }
}
