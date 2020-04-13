// @flow
import {
  determineQuality,
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  convertTmdbToImdb,
  sortTorrentsBySeeders,
  getHealth,
  resolveCache,
  setCache,
  merge,
} from "./BaseTorrentProvider";

type extendedDetailsType =
  | {}
  | {
      season: number,
      episode: number,
    };

/**
 * @TODO: Use ES6 dynamic imports here
 */
const providers = [
  import("./YtsTorrentProvider").then((e) => e.default || e),
  // import('./PbTorrentProvider').then(e => e.default || e),
  import("./PctTorrentProvider").then((e) => e.default || e),
  // import('./KatTorrentProvider').then(e => e.default || e)
  // import('./KatShowsTorrentProvider').then(e => e.default || e)
];

export function filterShows(show, season: number, episode: number) {
  return (
    show.metadata
      .toLowerCase()
      .includes(formatSeasonEpisodeToString(season, episode)) &&
    show.seeders !== 0 &&
    show.magnet
  );
}

/**
 * Select one 720p and 1080p quality movie from torrent list
 * By default, sort all torrents by seeders
 */
export function selectTorrents(
  torrents,
  returnAll: boolean = false,
  key: string
) {
  const sortedTorrents = sortTorrentsBySeeders(
    torrents.filter(
      (torrent) =>
        torrent.quality !== "n/a" && torrent.quality !== "" && !!torrent.magnet
    )
  );

  const formattedTorrents = returnAll
    ? sortedTorrents
    : {
        "480p": sortedTorrents.find((torrent) => torrent.quality === "480p"),
        "720p": sortedTorrents.find((torrent) => torrent.quality === "720p"),
        "1080p": sortedTorrents.find((torrent) => torrent.quality === "1080p"),
      };

  setCache(key, formattedTorrents);

  return formattedTorrents;
}

/**
 * Merge results from providers
 *
 * @param  {array} providerResults
 * @return {array}
 */
function appendAttributes(providerResults) {
  const formattedResults = merge(providerResults).map((result) => ({
    ...result,
    health: getHealth(result.seeders || 0, result.leechers || 0),
    quality:
      "quality" in result
        ? result.quality
        : determineQuality(result.magnet, result.metadata, result),
  }));

  return formattedResults;
}

export function filterShowsComplete(show, season: number) {
  const metadata = show.metadata.toLowerCase();

  return (
    metadata.includes(`${season} complete`) ||
    metadata.includes(`${season} [complete]`) ||
    metadata.includes(`${season} - complete`) ||
    metadata.includes(`season ${season}`) ||
    (metadata.includes(`s${formatSeasonEpisodeToObject(season).season}`) &&
      !metadata.includes("e0") &&
      show.seeders !== 0 &&
      show.magnet)
  );
}

export function getStatuses() {
  return Promise.all(providers.map((provider) => provider.getStatus())).then(
    (providerStatuses) =>
      providerStatuses.map((status, index) => ({
        providerName: providers[index].providerName,
        online: status,
      }))
  );
}

export default async function TorrentAdapter(
  _itemId: string,
  type: string,
  extendedDetails: extendedDetailsType = {},
  returnAll: boolean = false,
  method: string = "all",
  cache: boolean = true
) {
  const args = JSON.stringify({ extendedDetails, returnAll, method });

  if (resolveCache(args) && cache) {
    return resolveCache(args);
  }

  // Temporary hack to convert tmdbIds to imdbIds if necessary
  const itemId = !_itemId.includes("tt")
    ? await convertTmdbToImdb(_itemId)
    : _itemId;

  const torrentPromises = (await Promise.all(providers)).map((provider) =>
    provider.provide(itemId, type, extendedDetails)
  );

  switch (method) {
    case "all": {
      const providerResults = await Promise.all(torrentPromises);
      const { season, episode } = extendedDetails;

      switch (type) {
        case "movies":
          return selectTorrents(
            appendAttributes(providerResults).map((result) => ({
              ...result,
              method: "movies",
            })),
            returnAll,
            args
          );
        case "shows":
          return selectTorrents(
            appendAttributes(providerResults)
              .filter((show) => !!show.metadata)
              .filter((show) => filterShows(show, season, episode))
              .map((result) => ({
                ...result,
                method: "shows",
              })),
            returnAll,
            args
          );
        case "season_complete":
          return selectTorrents(
            appendAttributes(providerResults)
              .filter((show) => !!show.metadata)
              .filter((show) => filterShowsComplete(show, season))
              .map((result) => ({
                ...result,
                method: "season_complete",
              })),
            returnAll,
            args
          );
        default:
          throw new Error("Invalid query method");
      }
    }
    case "race": {
      return Promise.race(torrentPromises);
    }
    default:
      throw new Error("Invalid query method");
  }
}
