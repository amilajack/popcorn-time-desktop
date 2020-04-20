import { remote } from "electron";
import plyr from "plyr";
import network from "network-address";
import ChromecastPlayerProvider from "./players/ChromecastPlayerProvider";
import { ItemMetadata } from "./players/PlayerProviderInterface";
import { PlayerSubtitle } from "./Subtitle";

const { powerSaveBlocker } = remote;

export default class Player {
  currentPlayer = "plyr";

  powerSaveBlockerId?: number;

  player?: plyr;

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

  /**
   * Cleanup all traces of the player UI
   */
  destroy() {
    if (this.powerSaveBlockerId) {
      powerSaveBlocker.stop(this.powerSaveBlockerId);
    }
    if (this.player?.destroy) {
      this.player.destroy();
    }
  }

  /**
   * restart they player's state
   */
  restart() {
    this.player.restart();
  }

  static isFormatSupported(
    filename: string,
    mimeTypes: Array<string>
  ): boolean {
    return !!mimeTypes.find((mimeType) =>
      filename.toLowerCase().includes(mimeType)
    );
  }

  async initCast(
    provider: ChromecastPlayerProvider,
    streamingUrl: string,
    metadata: ItemMetadata,
    subtitles: Array<PlayerSubtitle> = []
  ) {
    this.powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");
    const addr = streamingUrl.replace("localhost", network());
    return provider.play(addr, metadata, subtitles);
  }

  initYouTube() {
    console.info("Initializing plyr...");
    this.currentPlayer = "plyr";
    this.player = {};
    return this.player;
  }

  initPlyr(): plyr {
    console.info("Initializing plyr...");
    this.currentPlayer = "plyr";
    this.powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");
    this.player = {};
    return this.player;
  }
}
