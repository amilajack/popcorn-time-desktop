import { Item } from "../metadata/MetadataProviderInterface";
import { Subtitle } from "../metadata/Subtitle";

export type PlayerSelectMetadata = Record<string, any>;

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

export interface PlayerProviderInterface {
  name: PlayerKind;

  getDevices: () => Promise<Device[]>;

  selectDevice: (id: string) => Promise<void>;

  seek: (seconds: number) => Promise<void>;

  play: (
    contentUrl: string,
    item: Item,
    subtitles: Subtitle[]
  ) => Promise<void>;

  pause: () => Promise<void>;

  restart: () => Promise<void>;

  setup: (metadata?: PlayerSelectMetadata) => Promise<void>;

  /**
   * Handle any logic to remove the traces of the player from memory
   */
  cleanup: () => Promise<void>;
}
