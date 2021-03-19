/**
 * Torrents controller, responsible for playing, stoping, etc
 */
import os from "os";
import WebTorrent, { TorrentFile } from "webtorrent";
// 'get-port' lib doesn't work here for some reason. Not sure why
import findFreePort from "find-free-port";
import { isExactEpisode } from "./BaseTorrentProvider";
import { TorrentKind } from "./TorrentProviderInterface";

type Metadata = {
  season: number;
  episode: number;
  kind: string;
};

/**
 * Get the subtitle file buffer given an array of files
 */
export function selectSubtitleFile(
  files: Array<{ name: string }> = [],
  kind: TorrentKind,
  metadata: { season: number; episode: number }
): { name: string } | boolean {
  return (
    files.find((file) => {
      const formatIsSupported = file.name.includes(".srt");

      switch (kind) {
        // Check if the current file is the exact episode we're looking for
        case "season_complete": {
          const { season, episode } = metadata;
          return (
            formatIsSupported && isExactEpisode(file.name, season, episode)
          );
        }

        // Check if the current file is greater than the previous file
        default:
          return formatIsSupported;
      }
    }) || false
  );
}

export default class Torrent {
  inProgress = false;

  finished = false;

  checkDownloadInterval?: NodeJS.Timeout;

  engine?: WebTorrent.Instance;

  magnetURI?: string;

  server?: {
    close: () => void;
    listen: (port: number) => void;
  };

  async start(
    magnetURI: string,
    metadata: Metadata,
    supportedFormats: Array<string>,
    cb: (
      servingUrl: string,
      file: { name: string },
      files: TorrentFile[],
      torrent: WebTorrent.Torrent,
      subtitle: WebTorrent.Torrent
    ) => void
  ) {
    if (this.inProgress) {
      console.log("Torrent already in progress");
      return;
    }

    const [port] = await findFreePort(9090);
    const { season, episode, kind: torrentKind } = metadata;
    const maxConns = process.env.CONFIG_MAX_CONNECTIONS
      ? parseInt(process.env.CONFIG_MAX_CONNECTIONS, 10)
      : 20;

    this.engine = new WebTorrent({ maxConns });
    this.inProgress = true;
    this.magnetURI = magnetURI;

    const cacheLocation =
      process.env.CONFIG_PERSIST_DOWNLOADS === "true"
        ? process.env.CONFIG_DOWNLOAD_LOCATION || "/tmp/popcorn-time-desktop"
        : os.tmpdir();

    this.engine.add(magnetURI, { path: cacheLocation }, (torrent) => {
      const server = torrent.createServer();
      this.server = server.listen(port);

      const { file, torrentIndex } = torrent.files.reduce(
        (previous, current, index) => {
          const formatIsSupported = !!supportedFormats.find((format) =>
            current.name.includes(format)
          );

          switch (torrentKind) {
            // Check if the current file is the exact episode we're looking for
            case "season_complete":
              if (
                formatIsSupported &&
                isExactEpisode(current.name, season, episode)
              ) {
                previous.file.deselect();
                return {
                  file: current,
                  torrentIndex: index,
                };
              }

              return previous;

            // Check if the current file is greater than the previous file
            default:
              if (formatIsSupported && current.length > previous.file.length) {
                previous.file.deselect();
                return {
                  file: current,
                  torrentIndex: index,
                };
              }

              return previous;
          }
        },
        { file: torrent.files[0], torrentIndex: 0 }
      );

      if (typeof torrentIndex !== "number") {
        console.warn(
          "File List",
          torrent.files.map((_file) => _file.name)
        );
        throw new Error(
          `No torrent could be selected. Torrent Index: ${torrentIndex}`
        );
      }

      const buffer = 1 * 1_024 * 1_024; // 1MB
      const { files } = torrent;

      file.select();

      torrent.on("done", () => {
        this.inProgress = false;
        this.clearInterval();
      });

      this.checkDownloadInterval = setInterval(() => {
        if (torrent.downloaded > buffer) {
          clearInterval(this.checkDownloadInterval as NodeJS.Timeout);
          this.clearInterval();
          cb(
            `http://localhost:${port}/${torrentIndex}`,
            file,
            files,
            torrent,
            torrent
          );
        }
      }, 1_000);
    });
  }

  clearInterval() {
    if (typeof this.checkDownloadInterval === "number") {
      clearInterval(this.checkDownloadInterval);
      this.checkDownloadInterval = undefined;
    }
  }

  destroy() {
    if (this.inProgress) {
      if (this.server && this.server.close) {
        console.log("Closing the torrent server...");
        this.server.close();
        this.server = undefined;
      }

      this.clearInterval();

      console.log("Destroying the torrent engine...");
      if (this.engine) {
        this.engine.destroy();
      }
      this.engine = undefined;

      this.inProgress = false;
    }
  }
}

type TorrentSpeeds = {
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  numPeers: number;
  ratio: number;
};

export function formatSpeeds(torrentSpeeds: TorrentSpeeds): TorrentSpeeds {
  const {
    downloadSpeed,
    uploadSpeed,
    progress,
    numPeers,
    ratio,
  } = torrentSpeeds;

  return {
    downloadSpeed: downloadSpeed / 1_000_000,
    uploadSpeed: uploadSpeed / 1_000_000,
    progress: Math.round(progress * 100) / 100,
    numPeers,
    ratio,
  };
}
