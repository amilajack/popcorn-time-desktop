/* eslint class-methods-use-this: off */
import { remote } from "electron";
import BaseTorrentProvider from "./BasePlayerProvider";
import { ItemMetadata } from "./PlayerProviderInterface";

const { powerSaveBlocker } = remote;

export default class PlayerProviderInterface extends BaseTorrentProvider
  implements PlayerProviderInterface {
  private powerSaveBlockerId?: number;

  private plyr?: Plyr;

  private isSetup = false;

  public readonly name = "plyr";

  getDevices() {
    return [];
  }

  play(url: string, metadata: ItemMetadata) {
    const { item, captions } = metadata;
    if (!this.plyr) throw new Error("plyr not setup");
    this.plyr.updateHtmlVideoSource(
      url,
      "video",
      item.title,
      undefined,
      captions
    );
    this.plyr.play();
  }

  restart() {
    if (!this.plyr) throw new Error("plyr not setup");
    this.plyr.restart();
  }

  pause() {
    if (!this.plyr) throw new Error("plyr not setup");
    this.plyr.pause();
  }

  setup({ plyr }: { plyr: Plyr }) {
    if (this.isSetup) return;
    this.plyr = plyr;
    this.powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");
    this.isSetup = true;
  }

  cleanup() {
    if (!this.isSetup) return;
    if (!this.plyr) throw new Error("plyr not setup");

    if (this.isPlaying) {
      this.pause();
    }
    // Plyr sometimes does not have destroy method
    if (this.plyr.destroy) {
      this.plyr.destroy();
    }
    if (this.powerSaveBlockerId) {
      powerSaveBlocker.stop(this.powerSaveBlockerId);
    }
    this.isSetup = false;
  }
}
