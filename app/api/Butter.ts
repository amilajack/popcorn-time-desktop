import TorrentAdapter from "./torrents/TorrentAdapter";
import MetadataAdapter from "./metadata/MetadataAdapter";

interface Butter extends TorrentAdapter, MetadataAdapter {}

const torrentAdapter = new TorrentAdapter();

class Butter extends MetadataAdapter {
  getTorrent = torrentAdapter.getTorrent;
}

export default Butter;
