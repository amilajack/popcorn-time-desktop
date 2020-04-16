import { Images } from "../metadata/MetadataProviderInterface";

export type Device = {
  id: string;
  name: string;
  address: string;
  port: number;
};

export type Metadata = {
  title: string;
  images: Images;
};

export interface PlayerProviderInterface {
  provider: string;

  providerId: string;

  selectedDevice?: Device;

  devices: Array<Device>;

  supportedFormats: Array<string>;

  supportsSubtitles: boolean;

  svgIconFilename: string;

  contentUrl: string;

  port: number;

  constructor: () => void;

  getDevices: (timeout: number) => Promise<Array<Device>>;

  seek: (seconds: number) => void;

  selectDevice: (deviceId: string) => Device;

  play: (contentUrl: string, metadata: Metadata) => Promise<void>;

  pause: () => Promise<void>;

  restart: () => Promise<void>;

  /**
   * Handle any logic to remove the traces of the player from memory
   */
  destroy: () => Promise<void>;

  /**
   * Check if the plugin is supported on the machine
   */
  isSupported: () => Promise<boolean>;
}
