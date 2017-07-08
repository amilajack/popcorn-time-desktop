//
//  Here is an example of the structure of a TorrentProvider
//

// Required:
// itemId
// type    | The type of torrent: movies or shows

// Example:
//
// getTorrent(itemId, type, {
//  searchQuery: 'harry potter and the half...',
//  ...otherCustomOptions
// })
//
// Return array of availabe torrents
// Preferrably, these should be ordered by best quality.
//
// [
//   {
//     quality: <number>, | Optional. If not provided, quality will be determined
//                        | by metadata using hueristics
//     magnet: <string>,
//     seeders: <number>,
//     leechers: <number>
//     metadata: <string>, | A concanenated string of data about a torrent,
//                         | used for hueristics
//     health: <string>, healthy || decent || poor
//     _provder: <string>
//   },
//   ...
// ]
