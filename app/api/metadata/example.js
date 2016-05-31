// Here is an example of the structure of a MetadataProvider
// All providers should take advantage of the Cache
//
//
// Here is an example of the structure of a MetadataProvider
//
// getMovie(imdbId) {}
//
// {
//   title: <string>,
//   year: <number>,
//   imdbId: <string>,
//   id: <string>, A general id that is not specific to movies. Reserved for future use
//   summary: <string>,
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
// getMovie(imdbId) {}
//
// getMovies(pageumber, limit, genre, sortMethod) {}
//
// search(searchQuery, genre, sortMethod) {}
//
// similar(imdbId) {}
