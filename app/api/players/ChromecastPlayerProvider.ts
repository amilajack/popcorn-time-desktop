//
import { Client, DefaultMediaReceiver } from "castv2-client";
import mdns from "mdns";
import network from "network-address";
import {
  PlayerProviderInterface,
  Device,
  Metadata,
} from "./PlayerProviderInterface";
import { Subtitle } from "../Player";

type Castv2Device = {
  fullname: string;
  addresses: Array<string>;
  port: number;
  txtRecord: {
    fn: string;
  };
};

export default class ChromecastPlayerProvider
  implements PlayerProviderInterface {
  provider = "Chromecast";

  providerId = "chromecast";

  supportsSubtitles = true;

  selectedDevice: Device;

  devices: Array<Device> = [];

  browser: {
    on: (event: string, cb: (device: Castv2Device) => void) => void;
    start: () => void;
    stop: () => void;
    removeAllListeners: () => void;
  };

  constructor() {
    this.browser = mdns.createBrowser(mdns.tcp("googlecast"));
  }

  destroy() {
    if (this.browser) {
      this.browser.stop();
    }
  }

  getDevices(timeout = 2000): Promise<Device[]> {
    return new Promise((resolve) => {
      const devices: Device[] = [];

      this.browser.on("serviceUp", (service) => {
        devices.push({
          name: service.txtRecord.fn,
          id: service.fullname,
          address: service.addresses[0],
          port: service.port,
        });
      });

      try {
        this.browser.start();
      } catch (e) {
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
    const selectedDevice = this.devices.find(
      (device) => device.id === deviceId
    );
    if (!selectedDevice) {
      throw new Error("Cannot find selected device");
    }
    this.selectedDevice = selectedDevice;
    return selectedDevice;
  }

  play(contentUrl: string, metadata: Metadata, subtitles: Array<Subtitle>) {
    const client = new Client();

    if (!this.selectDevice) {
      throw new Error("No device selected");
    }

    const networkAddress = network();
    const tracks = subtitles.map((subtitle, index) => ({
      trackId: index, // This is an unique ID, used to reference the track
      type: "TEXT", // Default Media Receiver currently only supports TEXT
      trackContentId: subtitle.src.replace("localhost", networkAddress), // the URL of the VTT (enabled CORS and the correct ContentType are required)
      trackContentType: "text/vtt", // Currently only VTT is supported
      name: subtitle.srclang, // a Name for humans
      language: subtitle.srclang, // the language
      subtype: "SUBTITLES", // should be SUBTITLES
    }));

    return new Promise((resolve, reject) => {
      client.connect(this.selectedDevice.address, () => {
        client.launch(DefaultMediaReceiver, (err: Error, player) => {
          if (err) reject(err);

          const media = {
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: contentUrl,
            contentType: "video/mp4",
            streamType: "BUFFERED", // or LIVE

            tracks,

            // Title and cover displayed while buffering
            metadata: {
              type: 0,
              metadataType: 0,
              title: metadata.title,
              images: [
                {
                  url: metadata.images.poster.full,
                },
                {
                  url: metadata.images.fanart.full,
                },
              ],
            },
          };

          player.load(
            media,
            { autoplay: true, activeTrackIds: tracks.map((e) => e.trackId) },
            (_err: Error) => {
              if (_err) reject(_err);
              resolve();
            }
          );
        });
      });
    });
  }
}
