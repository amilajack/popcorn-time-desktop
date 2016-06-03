export default class OmdbSearchProvider {
  /**
   * @todo: migrate from omdbapi to an api that can provide more information
   */
  static fetch(query, type = 'movie', page = 1) {
    if (!query) {
      throw Error('query paramater required');
    }

    console.log('some..........');

    return fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${type}&page=${page}`
    )
      .then(response => response.json())
      .then(response => response.Search.map(movie => format(movie)))
      .cath(err => { console.log(err); });
  }

  static provide(query, extended = {}) {
    try {
      const some = this.fetch(query).catch(err => []);
      return some;
    } catch (err) {
      console.log(err);
      return [];
    }
    // return this.fetch(query).catch(err => []);
  }
}

export function format(movie) {
  return {
    title: movie.Title,
    year: parseInt(movie.Year, 10),
    imdbId: movie.imdbID,
    id: movie.imdbID,
    summary: 'n/a',  // omdbapi does not support
    rating: 'n/a',   // omdbapi does not support
    runtime: {
      full: 'n/a',   // omdbapi does not support
      hours: 'n/a',  // omdbapi does not support
      minutes: 'n/a' // omdbapi does not support
    },
    trailer: 'n/a',  // omdbapi does not support
    images: {
      fanart: {
        full: movie.Poster,
        medium: movie.Poster,
        thumb: movie.Poster
      },
      poster: {
        full: movie.Poster,
        medium: movie.Poster,
        thumb: movie.Poster
      }
    }
  };
}
