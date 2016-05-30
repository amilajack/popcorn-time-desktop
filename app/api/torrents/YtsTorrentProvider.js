import { determineQuality } from './BaseTorrentProvider';
import fetch from 'isomorphic-fetch';


export default class YtsTorrentProvider {

  static fetch(imdbId) {
    return fetch(`https://yts.ag/api/v2/list_movies.json?query_term=${imdbId}`)
      .then(response => response.json());
  }

  static formatMovie(movie) {
    return {
      quality: determineQuality(movie.quality),
      magnet: constructMagnet(movie.hash),
      seeders: movie.seeds,
      leechers: 'n/a'
    };
  }

  static provide(imdbId) {
    return this.fetch(imdbId)
      .then(results => {
        if (!results.data.movie_count) return [];
        const torrents = results.data.movies[0].torrents;
        return torrents.splice(0, 10).map(this.formatMovie);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function constructMagnet(hash) {
  return `magnet:?xt=urn:btih:${hash}`;
}
