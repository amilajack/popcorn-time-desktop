// @flow
export type fetchType = {
  quality: string,
  magnet: string,
  seeders: number,
  leechers: number,
  metadata: '',
  _provider: 'string'
};

export type torrentType = {
  ...fetchType,
  health: healthType,
  quality: qualityType
};

export type healthType = 'poor' | 'decent' | 'healthy';

export type torrentMethodType = 'all' | 'race';

export type qualityType = '1080p' | '720p' | '480p';

export type torrentQueryType = 'movies' | 'show' | 'season_complete';

export interface ProviderInterface {
  static getStatus: () => Promise<boolean>,
  static fetch: (imdbId: string) => Promise<Array<fetchType>>,
  static provide: (
    imdbId: string,
    type: torrentType
  ) => Promise<Array<torrentType>>
}
