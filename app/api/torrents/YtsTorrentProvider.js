// @flow
import fetch from "isomorphic-fetch";
import {
  determineQuality,
  timeout,
  resolveEndpoint,
} from "./BaseTorrentProvider";
import type { TorrentProviderInterface } from "./TorrentProviderInterface";

const endpoint = "https://yts.am";
const providerId = "YTS";
const resolvedEndpoint = resolveEndpoint(endpoint, providerId);

const trackers = [
  "udp://glotorrents.pw:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://torrent.gresille.org:80/announce",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://tracker.leechers-paradise.org:6969",
  "udp://p4p.arenabg.ch:1337",
  "udp://tracker.internetwarriors.net:1337",
];

function constructMagnet(hash: string): string {
  return `magnet:?xt=urn:btih:${hash}&tr=${trackers.join("&tr=")}`;
}

export default class YtsTorrentProvider implements TorrentProviderInterface {
  static providerName = "YTS";

  static fetch(itemId: string) {
    return timeout(
      fetch(
        [
          `${resolvedEndpoint}/api/v2/list_movies.json`,
          `?query_term=${itemId}`,
          "&order_by=desc&sort_by=seeds&limit=50",
        ].join("")
      )
    ).then((res) => res.json());
  }

  static formatTorrent(torrent) {
    return {
      quality: determineQuality(torrent.quality),
      magnet: constructMagnet(torrent.hash),
      seeders: parseInt(torrent.seeds, 10),
      leechers: parseInt(torrent.peers, 10),
      metadata:
        String(torrent.url) + String(torrent.hash) || String(torrent.hash),
      _provider: "yts",
    };
  }

  static getStatus(): Promise<boolean> {
    return fetch("https://yts.am/api/v2/list_movies.json")
      .then((res) => !!res.ok)
      .catch(() => false);
  }

  static provide(itemId, type) {
    switch (type) {
      case "movies":
        return this.fetch(itemId).then((results) => {
          if (!results.data.movie_count) return [];
          const { torrents } = results.data.movies[0];
          return torrents.map(this.formatTorrent);
        });
      default:
        return Promise.resolve([]);
    }
  }
}
