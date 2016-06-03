import fetch from 'isomorphic-fetch';

/**
 * @todo
 */
export default class TraktSearchProvider {
  fetch(query) {
    return fetch();
  }

  provide(query, extended = {}) {
    return this.fetch(query).catch(() => []);
  }
}

export function format() {

}
