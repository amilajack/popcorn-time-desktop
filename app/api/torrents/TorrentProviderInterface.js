// @flow
export type fetchType = {
  quality: string,
  magnet: string,
  seeders: number,
  leechers: number,
  metadata: string,
  _provider: string
};

export type torrentType = {
  ...fetchType,
  health: healthType,
  quality: qualityType,
  method: torrentQueryType
};

export type healthType = 'poor' | 'decent' | 'healthy';

export type torrentMethodType = 'all' | 'race';

export type qualityType = '1080p' | '720p' | '480p' | 'default';

export type torrentQueryType = 'movies' | 'show' | 'season_complete';

export interface TorrentProviderInterface {
  supportedIdTypes: Array<'tmdb' | 'imdb'>,
  static getStatus: () => Promise<boolean>,
  static fetch: (itemId: string) => Promise<Array<fetchType>>,
  static provide: (
    itemId: string,
    type: torrentType
  ) => Promise<Array<torrentType>>
}
