// @flow
type providerResponseType = {
  quality: string,
  magnet: string,
  seeders: number,
  leechers: number,
  metadata: '',
  _provider: 'string'
};

export type torrentType = 'movies' | 'show' | 'season_complete';

export interface ProviderInterface {
  static getStatus: () => Promise<boolean>,
  static fetch: (imdbId: string) => Promise<Array<providerResponseType>>,
  static provide: (
    imdbId: string,
    type: torrentType
  ) => Array<providerResponseType>
}
