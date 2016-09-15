# PopcornTime Experimental Version History

## v0.0.5-alpha

### API
- CC support (opensubtitles, etc), SubtitleAdapter
- Favorites, Watch List, Recently Watched

### Dev
- Drop Webchimera support, migrate to native
- Add initial Flow support
- Add initial Redux support

### Feature
- Embedded subtitle support, **behind flag**
- Support external playback methods, **behind flag**
- Save preferences/App State to `~/.popcorn-time-desktop/{config, cache}.json`
- Downloaded content persistence
- Custom endpoint configuration (using env variables)
- Half-star ratings

### Perf
- Infinite scrolling performance improvements

## v0.0.4-alpha

### Feature
- Significant improvements in tv shows seeder count
- Query Season torrents and play individual episodes for increased torrent seeders **(HUGE seeder count win)**
- Get network speed, download speed, other diagnostic information
- Get torrent download speed, progress in percentage and mb
- Filter torrents with low seeder count

### API
- Set a timeout for `TorrentProvider`'s, should fail and return  if they exceed the timeout
- Get status of all `Providers` to notify users of endpoint downtime
- Metadata and Torrent API caching for faster responses

### Dev
- Screenshot testing
- Migrated to `webtorrent` from `peerflix`

## v0.0.3-alpha

### API
- Added concatenated torrent metadata (name, title, etc) as single metadata property, allow for imporoved torrent heuristics
- Added season summary to MetadataAdapter
- Added season summary to MetadataAdapter

### Dev
- Added support for non-native video formats using WebChimera, macOS, Windows
- Stabilized WebChimera, provide proper fallback methods, progress and buffering loading bindings
- Added initial electron-builder support

### Feature:
- Warn user if seeders count is low

## v0.0.2-alpha

### Features
* Initial support for TV shows
* Improved Butter API, added KatShowsTorrentProvider for further torrent support
* Fixed issue preventing search pagination
