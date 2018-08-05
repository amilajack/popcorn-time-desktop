// @flow
import { Client, DefaultMediaReceiver } from 'castv2-client';
import mdns from 'mdns';
import type {
  PlayerProviderInterface,
  deviceType,
  metadataType
} from './PlayerProviderInterface';

type castv2DeviceType = {
  fullname: string,
  addresses: Array<string>,
  port: number,
  txtRecord: {
    fn: string
  }
};

class ChromecastPlayerProvider implements PlayerProviderInterface {
  provider = 'Chromecast';

  providerId = 'chromecast';

  supportsSubtitles = true;

  selectedDevice: deviceType;

  devices: Array<deviceType> = [];

  browser: {
    on: (event: string, cb: (device: castv2DeviceType) => void) => void,
    start: () => void,
    stop: () => void,
    removeAllListeners: () => void
  };

  constructor() {
    this.browser = mdns.createBrowser(mdns.tcp('googlecast'));
  }

  destroy() {
    if (this.browser) {
      this.browser.stop();
    }
  }

  getDevices(timeout: number = 2000) {
    return new Promise(resolve => {
      const devices = [];

      this.browser.on('serviceUp', service => {
        devices.push({
          name: service.txtRecord.fn,
          id: service.fullname,
          address: service.addresses[0],
          port: service.port
        });
      });

      try {
        this.browser.start();
      } catch(e) {
        console.log(e);
      }

      setTimeout(() => {
        this.browser.stop();
        this.browser.removeAllListeners();
        resolve(devices);
        this.devices = devices;
      }, timeout);
    });
  }

  selectDevice(deviceId: string) {
    const selectedDevice = this.devices.find(device => device.id === deviceId);
    if (!selectedDevice) {
      throw new Error('Cannot find selected device');
    }
    this.selectedDevice = selectedDevice;
    return selectedDevice;
  }

  play(contentUrl: string, metadata: metadataType) {
    const client = new Client();

    if (!this.selectDevice) {
      throw new Error('No device selected');
    }

    return new Promise((resolve, reject) => {
      client.connect(
        this.selectedDevice.address,
        () => {
          client.launch(DefaultMediaReceiver, (err, player) => {
            if (err) reject(err);

            const media = {
              // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
              contentId: contentUrl,
              contentType: 'video/mp4',
              streamType: 'BUFFERED', // or LIVE

              // Title and cover displayed while buffering
              metadata: {
                type: 0,
                metadataType: 0,
                title: metadata.title,
                images: [
                  {
                    url: metadata.images.poster.full
                  },
                  {
                    url: metadata.images.fanart.full
                  }
                ]
              }
            };

            player.load(media, { autoplay: true }, _err => {
              if (_err) reject(_err);
              resolve();
            });
          });
        }
      );
    });
  }
}

export default ChromecastPlayerProvider;
