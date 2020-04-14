// @flow
/* eslint prefer-template: 0 */
import Cache from "lru-cache";
import url from "url";
import TheMovieDbMetadataProvider from "../metadata/TheMovieDbMetadataProvider";
import type { torrentType } from "./TorrentProviderInterface";

export const providerCache = new Cache({
  maxAge: process.env.CONFIG_CACHE_TIMEOUT
    ? parseInt(process.env.CONFIG_CACHE_TIMEOUT, 10) * 1000 * 60 * 60
    : 1000 * 60 * 60, // 1 hr
});

// Create a promise that rejects in <ms> milliseconds
export function timeout(promise: Promise<any>, ms: number = 20000) {
  const timeoutPromise = new Promise((resolve, reject) => {
    const id = setTimeout(
      () => {
        clearTimeout(id);
        reject(new Error("Torrent Provider timeout exceeded"));
      },
      process.env.CONFIG_API_TIMEOUT
        ? parseInt(process.env.CONFIG_API_TIMEOUT, 10)
        : ms
    );
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeoutPromise]);
}

export function getHealth(seeders: number = 0, leechers: number = 1): string {
  const ratio = seeders / leechers;

  if (seeders < 50) {
    return "poor";
  }

  if (ratio > 0.4 && seeders >= 50 && seeders < 500) {
    return "decent";
  }

  if (ratio > 0.7 && seeders >= 100) {
    return "healthy";
  }

  return "poor";
}

export function hasNonEnglishLanguage(metadata: string): boolean {
  if (metadata.includes("french")) return true;
  if (metadata.includes("german")) return true;
  if (metadata.includes("greek")) return true;
  if (metadata.includes("dutch")) return true;
  if (metadata.includes("hindi")) return true;
  if (metadata.includes("português")) return true;
  if (metadata.includes("portugues")) return true;
  if (metadata.includes("spanish")) return true;
  if (metadata.includes("español")) return true;
  if (metadata.includes("espanol")) return true;
  if (metadata.includes("latino")) return true;
  if (metadata.includes("russian")) return true;
  if (metadata.includes("subtitulado")) return true;

  return false;
}

export function hasSubtitles(metadata: string): boolean {
  return metadata.includes("sub");
}

export function sortTorrentsBySeeders(torrents: Array<any>): Array<any> {
  return torrents.sort((prev: Object, next: Object) =>
    prev.seeders === next.seeders ? 0 : prev.seeders > next.seeders ? -1 : 1
  );
}

export function constructMovieQueries(
  title: string,
  itemId: string
): Array<string> {
  const queries = [
    title, // default
    itemId,
  ];

  return title.includes("'") ? [...queries, title.replace(/'/g, "")] : queries;
}

export function formatSeasonEpisodeToObject(
  season: number,
  episode: ?number
): Object {
  return {
    season: String(season).length === 1 ? "0" + String(season) : String(season),
    episode:
      String(episode).length === 1 ? "0" + String(episode) : String(episode),
  };
}

export function constructSeasonQueries(
  title: string,
  season: number
): Array<string> {
  const formattedSeasonNumber = `s${
    formatSeasonEpisodeToObject(season, 1).season
  }`;

  return [
    `${title} season ${season}`,
    `${title} season ${season} complete`,
    `${title} season ${formattedSeasonNumber} complete`,
  ];
}

/**
 * @param {array} results | A two-dimentional array containing arrays of results
 */
export function merge(results: Array<any>) {
  return results.reduce((previous, current) => [...previous, ...current]);
}

export function resolveEndpoint(defaultEndpoint: string, providerId: string) {
  const endpointEnvVariable = `CONFIG_ENDPOINT_${providerId}`;

  switch (process.env[endpointEnvVariable]) {
    case undefined:
      return defaultEndpoint;
    default:
      return url.format({
        ...url.parse(defaultEndpoint),
        hostname: process.env[endpointEnvVariable],
        host: process.env[endpointEnvVariable],
      });
  }
}

export function getIdealTorrent(torrents: Array<torrentType>): torrentType {
  const idealTorrent = torrents
    .filter((torrent) => !!torrent)
    .filter(
      (torrent) =>
        !!torrent && !!torrent.magnet && typeof torrent.seeders === "number"
    );

  return idealTorrent.sort((prev: torrentType, next: torrentType) => {
    if (prev.seeders === next.seeders) {
      return 0;
    }

    if (!next.seeders || !prev.seeders) return 1;

    return prev.seeders > next.seeders ? -1 : 1;
  })[0];
}

export function handleProviderError(error: Error) {
  if (process.env.NODE_ENV === "development") {
    console.log(error);
  }
}

export function resolveCache(key: string): boolean | any {
  if (process.env.API_USE_MOCK_DATA === "true") {
    const mock = {
      ...require("../../../test/api/metadata.mock"), // eslint-disable-line global-require
      ...require("../../../test/api/torrent.mock"), // eslint-disable-line global-require
    };

    const resolvedCacheItem = Object.keys(mock).find(
      (mockKey: string): boolean =>
        key.includes(`${mockKey}"`) && !!Object.keys(mock[mockKey]).length
    );

    if (resolvedCacheItem) {
      return resolvedCacheItem;
    }

    console.warn("Fetching from network:", key);

    return false;
  }

  return providerCache.has(key) ? providerCache.get(key) : false;
}

export function setCache(key: string, value: any) {
  if (process.env.NODE_ENV === "development") {
    console.info("Setting cache key:", key);
  }
  return providerCache.set(key, value);
}

export function hasNonNativeCodec(metadata: string): boolean {
  return metadata.includes("avi") || metadata.includes("mkv");
}

export function determineQuality(
  magnet: string,
  metadata: string = ""
): string {
  const lowerCaseMetadata = (metadata || magnet).toLowerCase();

  if (process.env.FLAG_UNVERIFIED_TORRENTS === "true") {
    return "480p";
  }

  // Filter non-english languages
  if (hasNonEnglishLanguage(lowerCaseMetadata)) {
    return "";
  }

  // Filter videos with 'rendered' subtitles
  if (hasSubtitles(lowerCaseMetadata)) {
    return process.env.FLAG_SUBTITLE_EMBEDDED_MOVIES === "true" ? "480p" : "";
  }

  // Most accurate categorization
  if (lowerCaseMetadata.includes("1080")) return "1080p";
  if (lowerCaseMetadata.includes("720")) return "720p";
  if (lowerCaseMetadata.includes("480")) return "480p";

  // Guess the quality 1080p
  if (lowerCaseMetadata.includes("bluray")) return "1080p";
  if (lowerCaseMetadata.includes("blu-ray")) return "1080p";

  // Guess the quality 720p, prefer english
  if (lowerCaseMetadata.includes("dvd")) return "720p";
  if (lowerCaseMetadata.includes("rip")) return "720p";
  if (lowerCaseMetadata.includes("mp4")) return "720p";
  if (lowerCaseMetadata.includes("web")) return "720p";
  if (lowerCaseMetadata.includes("hdtv")) return "720p";
  if (lowerCaseMetadata.includes("eng")) return "720p";

  if (hasNonNativeCodec(lowerCaseMetadata)) {
    return process.env.FLAG_SUPPORTED_PLAYBACK_FILTERING === "true"
      ? "720p"
      : "";
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`${magnet}, could not be verified`);
  }

  return "";
}

export async function convertTmdbToImdb(tmdbId: string): Promise<string> {
  const theMovieDbProvider = new TheMovieDbMetadataProvider();
  const movie = await theMovieDbProvider.getMovie(tmdbId);
  if (!movie.ids.imdbId) {
    throw new Error("Cannot convert tmdbId to imdbId");
  }
  return movie.ids.imdbId;
}

export function formatSeasonEpisodeToString(
  season: number,
  episode: number
): string {
  return (
    "s" +
    (String(season).length === 1 ? "0" + String(season) : String(season)) +
    ("e" +
      (String(episode).length === 1 ? "0" + String(episode) : String(episode)))
  );
}

export function isExactEpisode(
  title: string,
  season: number,
  episode: number
): boolean {
  return title
    .toLowerCase()
    .includes(formatSeasonEpisodeToString(season, episode));
}
