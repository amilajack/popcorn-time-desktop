/**
 * Provide a single API interface for all the providers
 * @flow
 */
import ChromecastPlayerProvider from './ChromecastPlayerProvider';
import type {
  PlayerProviderInterface,
  deviceType
} from './PlayerProviderInterface';

export default class PlayerAdapter {
  providers: Array<PlayerProviderInterface> = [new ChromecastPlayerProvider()];

  devices: Array<deviceType>;

  selectedDevice: deviceType;

  getDevices() {
    return Promise.all(
      this.providers.map(provider => provider.getDevices(2000))
    );
  }

  /**
   * @TODO: Proxy all other method calls (ex. play, etc) to the selectedDevice
   *        instance
   */
}
