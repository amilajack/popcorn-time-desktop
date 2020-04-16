/**
 * Provide a single API interface for all the providers
 *
 */
import ChromecastPlayerProvider from "./ChromecastPlayerProvider";
import { PlayerProviderInterface, Device } from "./PlayerProviderInterface";

export default class PlayerAdapter {
  providers: Array<PlayerProviderInterface> = [new ChromecastPlayerProvider()];

  devices: Array<Device>;

  selectedDevice: Device;

  getDevices() {
    return Promise.all(
      this.providers.map((provider) => provider.getDevices(2000))
    );
  }

  /**
   * @TODO: Proxy all other method calls (ex. play, etc) to the selectedDevice
   *        instance
   */
}
