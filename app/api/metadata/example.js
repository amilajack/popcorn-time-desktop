// Here is an example of the structure of a MetadataProvider
// All providers should take advantage of the Cache
//
//
// Here is an example of the structure of a MetadataProvider
//
// getMovie(itemId) {}
//
// {
//   title: <string>,
//   year: <number>,
//   ids: {
//     imdbId: 'tt134145',
//     tmdbId: '2414140'
//   }
//   summary: <string>,
//   genres: <array>,
//   runtime: {
//      full: <number>,
//      hours: <number>,
//      minutes: <number>
//   },
//   trailer: <string>, A link to the trailer of the movie
//   rating: <number>, 1 - 5, round to 1 decimal place || <string> n/a
//   images: {
//     fanart: {
//        full: <string>
//        medium: <string>
//        thumb: <string>
//     },
//     poster: {
//        full: <string>
//        medium: <string>
//        thumb: <string>
//     },
//   }
// }
//
// getMovie(itemId) {}
//
// getMovies(pageumber, limit, genre, sortMethod) {}
//
// search(searchQuery, genre, sortMethod) {}
//
// similar(itemId) {}
//
// getSeasons(itemId) {}
//
// [
//   {
//     season: 1,
//     images: {
//       full: <string>,
//       medium: <string>,
//       thumb: <string>
//     }
//   }
//   ...
// ]
//
// getSeason(itemId, season) {}
//
// [
//   {
//     title: 'Winter Is Coming',
//     id: 'tt1480055',
//     season: 1,
//     episode: 1,
//     rating: <number>, 1 - 5, round to 1 decimal place || <string> n/a
//     images: {
//       full: <string>,
//       medium: <string>,
//       thumb: <string>
//     }
//   }
//   ...
// ]
//
// getEpisode(itemId, season, episode) {}
//
// {
//   title: 'Winter Is Coming',
//   id: itemId,
//   season: 1,
//   episode: 1,
//   overview: 'Ned Stark, Lord of Winterfell learns...'
//   images: {
//     full: <string>,
//     medium: <string>,
//     thumb: <string>
//   }
// }
