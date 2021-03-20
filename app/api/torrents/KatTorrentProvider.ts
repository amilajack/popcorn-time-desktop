// @ts-nocheck
import { search } from "super-kat";
import {
  formatSeasonEpisodeToString,
  constructSeasonQueries,
  constructMovieQueries,
  timeout,
  handleProviderError,
  resolveEndpoint,
} from "./BaseTorrentProvider";
import {
  TorrentProviderInterface,
  ExtendedDetails,
  ProviderTorrent,
} from "./TorrentProviderInterface";
import { ItemKind } from "../metadata/MetadataProviderInterface";

const endpoint = "https://katproxy.al";
const providerId = "KAT";
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

type RawTorrent = {
  magnet: string;
  seeders: number;
  leechers: number;
  metadata: string;
  title: string;
};

export default class KatTorrentProvider implements TorrentProviderInterface {
  static providerName = "Kat";

  static fetch(query: string): ProviderTorrent[] {
    return search(query)
      .then((torrents: RawTorrent[]) =>
        torrents
          .map((torrent) => this.formatTorrent(torrent))
          .filter((torrent) => !!torrent.magnet)
      )
      .catch((error: Error) => {
        handleProviderError(error);
        return [];
      });
  }

  static formatTorrent(torrent: RawTorrent): ProviderTorrent {
    return {
      quality: "1080p",
      magnet: torrent.magnet,
      seeders: torrent.seeders,
      leechers: torrent.leechers,
      metadata:
        String(torrent.title + torrent.magnet) || String(torrent.magnet),
      _provider: "kat",
    };
  }

  static getStatus(): Promise<boolean> {
    return fetch(resolvedEndpoint)
      .then((res) => res.ok)
      .catch(() => false);
  }

  static provide(
    itemId: string,
    type: ItemKind,
    extendedDetails: ExtendedDetails = {}
  ): Promise<ProviderTorrent[]> {
    const { searchQuery } = extendedDetails;

    switch (type) {
      case ItemKind.Movie:
        return (
          timeout(
            Promise.all<RawTorrent[]>(
              constructMovieQueries(searchQuery, itemId).map((query) =>
                this.fetch(query)
              )
            )
          )
            // Flatten array of arrays to an array with no empty arrays
            .then((res) => res.flat().filter((array) => array.length !== 0))
            .catch((error) => {
              handleProviderError(error);
              return [];
            })
        );
      case ItemKind.Show: {
        const { season, episode } = extendedDetails;

        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        ).catch((error: Error) => {
          handleProviderError(error);
          return [];
        });
      }
      case "season_complete": {
        const { season } = extendedDetails;
        const queries = constructSeasonQueries(searchQuery, season);

        return timeout(Promise.all(queries.map((query) => this.fetch(query))))
          .then((res) => res.flat())
          .catch((error) => {
            handleProviderError(error);
            return [];
          });
      }
      default:
        return Promise.resolve([]);
    }
  }
}
