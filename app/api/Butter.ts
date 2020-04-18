/**
 * The highest level abstraction layer for querying torrents and metadata
 */
import TorrentAdapter from "./torrents/TorrentAdapter";
import MetadataAdapter from "./metadata/MetadataAdapter";

class Butter {}

interface Butter extends TorrentAdapter, MetadataAdapter {}

export default Butter;
