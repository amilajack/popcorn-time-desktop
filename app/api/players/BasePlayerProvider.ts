import { Item } from "../metadata/MetadataProviderInterface";
import { Subtitle } from "../metadata/Subtitle";

export default class BasePlayerProvider {
  public isPlaying = false;

  async play(contentUrl: string, item: Item, subtitles: Subtitle[]) {
    if (!this.isPlaying) {
      this.play(contentUrl, item, subtitles);
      this.isPlaying = true;
    }
  }

  async pause() {
    if (this.isPlaying) {
      this.pause();
      this.isPlaying = false;
    }
  }
}
