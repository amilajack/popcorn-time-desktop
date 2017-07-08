// @flow
// Initialize the player

export type deviceType = {
  id: string,
  name: string,
  address: string,
  port: number
};

export type metadataType = {
  title: string,
  image: {
    poster: string
  }
};

export interface PlayerProviderInterface {
  provider: string,

  providerId: string,

  selectedDevice?: deviceType,

  devices: Array<deviceType>,

  supportedFormats: Array<string>,

  supportsSubtitles: boolean,

  svgIconFilename: string,

  contentUrl: string,

  port: number,

  constructor: () => void,

  getDevices: (timeout: number) => Promise<Array<deviceType>>,

  seek: (seconds: number) => void,

  selectDevice: (deviceId: string) => deviceType,

  play: (contentUrl: string, metadata: metadataType) => Promise<void>,

  pause: () => Promise<void>,

  restart: () => Promise<void>,

  /**
   * Handle any logic to remove the traces of the player from memory
   */
  destroy: () => Promise<void>,

  /**
   * Check if the plugin is supported on the machine
   */
  isSupported: () => Promise<boolean>
}
