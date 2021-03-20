// @ts-nocheck
/**
 * Pirate Bay torrent provider
 */
import fetch from "node-fetch";
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
  ProviderTorrent,
  SearchDetail,
} from "./TorrentProviderInterface";
import { ItemKind } from "../metadata/MetadataProviderInterface";

const endpoint = "https://pirate-bay-endpoint.herokuapp.com";
const providerId = "PB";
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

type RawTorrent = {
  magnetLink: string;
  seeders: string;
  leechers: string;
  name: string;
  link: string;
};

export default class PbTorrentProvider implements TorrentProviderInterface {
  static providerName = "PirateBay";

  static fetch(searchQuery: string): Promise<ProviderTorrent[]> {
    // HACK: Temporary solution to improve performance by side stepping
    //       PirateBay's database errors.
    const searchQueryUrl = `${resolvedEndpoint}/search/${searchQuery}`;

    return timeout(fetch(searchQueryUrl))
      .then((res) => res.json())
      .then((torrents) =>
        torrents.map((torrent: RawTorrent) => this.formatTorrent(torrent))
      )
      .catch((error) => {
        handleProviderError(error);
        return [];
      });
  }

  static formatTorrent(torrent: RawTorrent): ProviderTorrent {
    return {
      quality: "1080p",
      magnet: torrent.magnetLink,
      seeders: parseInt(torrent.seeders, 10),
      leechers: parseInt(torrent.leechers, 10),
      metadata:
        (String(torrent.name) || "") +
        (String(torrent.magnetLink) || "") +
        (String(torrent.link) || ""),
      _provider: "pb",
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
    extendedDetails: SearchDetail
  ): Promise<ProviderTorrent[]> {
    if (!extendedDetails.searchQuery) {
      return new Promise((resolve) => resolve([]));
    }

    const { searchQuery } = extendedDetails;

    switch (type) {
      case ItemKind.Movie: {
        return (
          Promise.all(
            constructMovieQueries(searchQuery, itemId).map((query) =>
              this.fetch(query)
            )
          )
            // Flatten array of arrays to an array with no empty arrays
            .then((res) => res.flat().filter((array) => array.length !== 0))
            .catch((error) => {
              handleProviderError(error);
              return [];
            })
        );
      }
      case ItemKind.Show: {
        const { season, episode } = extendedDetails;
        return this.fetch(
          `${searchQuery} ${formatSeasonEpisodeToString(season, episode)}`
        ).catch((error) => {
          handleProviderError(error);
          return [];
        });
      }
      case "season_complete": {
        const { season } = extendedDetails;
        const queries = constructSeasonQueries(searchQuery, season);

        return (
          Promise.all(queries.map((query) => this.fetch(query)))
            // Flatten array of arrays to an array with no empty arrays
            .then((res) => res.flat().filter((array) => array.length !== 0))
            .catch((error) => {
              handleProviderError(error);
              return [];
            })
        );
      }
      default:
        return Promise.resolve([]);
    }
  }
}
