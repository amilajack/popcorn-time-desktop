/**
 * Butter is single API that abstracts over all the APIs
 */
import TorrentAdapter from "./torrents/TorrentAdapter";
import MetadataAdapter from "./metadata/MetadataAdapter";
import Cache, { PctCache } from "./torrents/Cache";
import { Torrent } from "./torrents/TorrentProviderInterface";
import { Item } from "./metadata/MetadataProviderInterface";

interface Butter extends TorrentAdapter, MetadataAdapter {}

const cache: PctCache = new Cache<string, Item | Item[] | Torrent>();

const torrentAdapter = new TorrentAdapter({
  cache,
});

class Butter extends MetadataAdapter {
  getTorrent = torrentAdapter.getTorrent;
}

export default Butter;
