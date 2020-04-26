import ChromecastPlayerProvider from "./ChromecastPlayerProvider";
import PlyrPlayerProvider from "./PlyrPlayerProvider";
import {
  PlayerProviderInterface,
  PlayerSelectMetadata,
  PlayerKind,
  Device,
} from "./PlayerProviderInterface";
import { Subtitle } from "../metadata/Subtitle";
import { Item } from "../metadata/MetadataProviderInterface";

/**
 * Provide a single API interface for all the providers
 *
 * @example
 * ```ts
 * const player = new PlayerAdapter();
 * await player.selectPlayer(PlayerKind.ChromeCast);
 * await player.play();
 * await player.pause();
 * ```
 */
export default class PlayerAdapter {
  static nativePlaybackFormats = [
    "mp4",
    "ogg",
    "mov",
    "webmv",
    "mkv",
    "wmv",
    "avi",
  ];

  static experimentalPlaybackFormats = [];

  private providers: Map<PlayerKind, PlayerProviderInterface> = new Map([
    [PlayerKind.Plyr, new PlyrPlayerProvider()],
    [PlayerKind.Chromecast, new ChromecastPlayerProvider()],
  ]);

  private provider: PlayerProviderInterface = this.providers.get(
    PlayerKind.Plyr
  ) as PlayerProviderInterface;

  public isPlaying = false;

  public async selectPlayer(
    playerKind: PlayerKind,
    metadata: PlayerSelectMetadata = {}
  ): Promise<void> {
    if (!this.providers.has(playerKind)) {
      throw new Error(`Player "${playerKind}" not supported`);
    }
    await this.provider.cleanup();
    this.provider = this.providers.get(playerKind) as PlayerProviderInterface;
    return this.provider.setup(metadata);
  }

  public play(
    url: string,
    metadata: Item,
    subtitles: Subtitle[] = []
  ): Promise<void> {
    return this.provider.play(url, metadata, subtitles);
  }

  public pause(): Promise<void> {
    return this.provider.pause();
  }

  public setup(arg: Record<string, any>): Promise<void> {
    return this.provider.setup(arg);
  }

  public cleanup(): Promise<void> {
    return this.provider.cleanup();
  }

  getPlayerName(): PlayerKind {
    return this.provider.name;
  }

  public async getDevices(): Promise<Device[]> {
    const providers = Array.from(this.providers.values());
    const devices = await Promise.all(
      providers.map((provider) => provider.getDevices())
    );
    return devices.flat();
  }
}
