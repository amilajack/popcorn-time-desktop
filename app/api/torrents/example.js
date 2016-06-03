//
//  Here is an example of the structure of a TorrentProvider
//

// getTorrent(imdbId, {
//  searchQuery: 'harry potter and the half...',
//  ...otherCustomOptions
// })
//
// Return array of availabe torrents
// Preferrably, these should be ordered by best quality.
//
// [
//   {
//     quality: <string>, 1080p || 720p,
//     magnet: <string>
//     seeders: <number>
//     leechers: <number>
//   },
//   ...
// ]
