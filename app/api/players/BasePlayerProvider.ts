export default class BasePlayerProvider {
  public isPlaying = false;

  play() {
    if (!this.isPlaying) {
      this.play();
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.isPlaying) {
      this.pause();
      this.isPlaying = false;
    }
  }
}
