// @flow
type providerResponseType = {
  quality: string,
  magnet: string,
  seeders: number,
  leechers: number,
  metadata: '',
  _provider: 'string'
};

export interface ProviderInterface {
  static getStatus: () => Promise<bool>,
  static fetch: (imdbId: string) => Array<Object>,
  static provide: (imdbId: string, type: string) => Array<providerResponseType>
}
