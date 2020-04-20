import { Item } from "../metadata/MetadataProviderInterface";

export type PlayerSelectMetadata = Record<string, any>;

export type PlayerCaptions = Array<{
  src: string;
  srclang: string;
}>;

export enum PlayerKind {
  Plyr = "plyr",
  Chromecast = "chromecast",
  YouTube = "youtube",
}

export type Device = {
  id: string;
  name: string;
  address: string;
  port: number;
};

export type PlayerKindNames = "plyr" | "chromecast" | "youtube";

export type ItemMetadata = {
  item: Item;
  captions: PlayerCaptions;
};

export interface PlayerProviderInterface {
  name: PlayerKind;

  getDevices: () => Promise<Device[]>;

  selectDevice: (id: string) => Promise<void>;

  seek: (seconds: number) => void;

  play: (contentUrl: string, metadata?: ItemMetadata) => Promise<void>;

  pause: () => Promise<void>;

  restart: () => Promise<void>;

  setup: (metadata?: PlayerSelectMetadata) => Promise<void>;

  /**
   * Handle any logic to remove the traces of the player from memory
   */
  cleanup: () => Promise<void>;
}
