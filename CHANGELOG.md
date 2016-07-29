# PopcornTime Experimental Version History

## v0.0.4-alpha

## Feature
- Significant improvements in tv shows seeder count

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
