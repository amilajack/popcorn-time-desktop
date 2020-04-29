/* eslint prefer-template: off */
import url from "url";
import TheMovieDbMetadataProvider from "../metadata/TheMovieDbMetadataProvider";
import { Torrent, Health } from "./TorrentProviderInterface";
import SettingsManager from "../../utils/Settings";

// Create a promise that rejects in <ms> milliseconds
export function timeout<T>(promise: Promise<T>, ms = 20_000): Promise<T> {
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

export function getHealth(seeders = 0, leechers = 1): Health {
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

export function hasNonEnglishLanguage(language: string): boolean {
  return [
    "french",
    "german",
    "greek",
    "dutch",
    "hindi",
    "português",
    "portugues",
    "spanish",
    "español",
    "espanol",
    "latino",
    "russian",
    "subtitulado",
  ].includes(language);
}

export function hasSubtitles(metadata: string): boolean {
  return metadata.includes("sub");
}

export function sortTorrentsBySeeders(torrents: Torrent[]): Torrent[] {
  return torrents.sort((a, b) => b.seeders - a.seeders);
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
  episode?: number
): { season: string; episode: string } {
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

/**
 * Sort the torrents by seeders in descending order
 */
export function selectIdealTorrent(
  torrents: Array<Torrent>
): Torrent | undefined {
  const idealTorrent = torrents
    .filter((torrent) => !!torrent && torrent.seeders)
    .filter(
      (torrent) =>
        !!torrent && !!torrent.magnet && typeof torrent.seeders === "number"
    );

  return idealTorrent.sort(
    (a: Torrent, b: Torrent) => b.seeders - a.seeders
  )[0];
}

export function handleProviderError(error: Error) {
  if (process.env.NODE_ENV === "development") {
    console.log(error);
  }
}

export function hasNonNativeCodec(metadata: string): boolean {
  return metadata.includes("avi") || metadata.includes("mkv");
}

export function determineQuality(magnet: string, metadata = ""): string {
  const lowerCaseMetadata = (metadata || magnet).toLowerCase();

  // Filter non-english languages
  if (hasNonEnglishLanguage(lowerCaseMetadata)) {
    return "";
  }

  // Filter videos with 'rendered' subtitles
  if (hasSubtitles(lowerCaseMetadata)) {
    return SettingsManager.isFlagEnabled("subtitle_embedded_movies")
      ? "480p"
      : "";
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
    return "720p";
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`${magnet}, could not be verified`);
  }

  return SettingsManager.isFlagEnabled("unverified_torrents") ? "7200p" : "";
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
