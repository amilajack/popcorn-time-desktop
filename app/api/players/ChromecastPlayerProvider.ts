import { Client, DefaultMediaReceiver, Player } from "castv2-client";
import mdns, { Browser } from "mdns-js";
import network from "network-address";
import { PlayerProviderInterface, Device, PlayerKind } from "./PlayerProviderInterface";
import { Subtitle } from "../metadata/Subtitle";
import { Item } from "../metadata/MetadataProviderInterface";

type RawDevice = {
  addresses: string[];
  fullname: string;
  host: string;
  interfaceIndex: number;
  networkInterface: string;
  port: number;
  type: Array<{
    description: string;
    name: string;
    protocol: string;
  }>;
};

type DeviceMap = Map<string, Device>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default class ChromecastPlayerProvider
  implements PlayerProviderInterface {
  name = PlayerKind.Chromecast;
  provider = "Chromecast";

  providerId = "chromecast";

  private selectedDevice?: Device;

  private devices: DeviceMap = new Map<string, Device>();

  private browser: Browser;

  constructor() {
    // this.browser = mdns.createBrowser();
    // this.browser = mdns.createBrowser(mdns.tcp("airplay"));
    this.browser = mdns.createBrowser(mdns.tcp("googlecast"));
    this.browser.on("ready", () => {
      this.browser.discover();
    });

    this.browser.on("update", (data: RawDevice | RawDevice[]) => {
      if (Array.isArray(data)) {
        data?.forEach((device) => {
        console.log(device)
          this.devices.set(device.fullname, {
            id: device.fullname,
            address: device.addresses[0],
            port: device.port,
            name: device.fullname,
          });
        });
      } else {
        const device = data;
        console.log(device)
        this.devices.set(device.fullname, {
            id: device.fullname,
            address: device.addresses[0],
            port: device.port,
            name: device.fullname,
        });
      }
    });
  }

  // @TODO
  public async setup() {}
  public async pause() {}
  public async seek() {}
  public async restart() {}

  async cleanup() {
    if (this.browser) {
      this.browser.stop();
    }
  }

  public async getDevices(timeout = 5_000): Promise<Device[]> {
    await delay(timeout);
    const deviceList = Array.from(this.devices.values());
    if (deviceList.length) {
      this.selectDevice(deviceList[0].id);
    }
    return deviceList;
  }

  async selectDevice(deviceId: string): Promise<void> {
    const selectedDevice = Array.from(this.devices.values()).find(
      (device) => device.id === deviceId
    );
    if (!selectedDevice) {
      throw new Error("Cannot find selected device");
    }
    this.selectedDevice = selectedDevice;
  }

  async play(
    contentUrl: string,
    item: Item,
    subtitles: Subtitle[]
  ): Promise<void> {
    const client = new Client();

    if (!this.selectedDevice) {
      throw new Error("No device selected");
    }

    const networkAddress = network();
    const tracks = subtitles.map((subtitle, index) => ({
      trackId: index, // This is an unique ID, used to reference the track
      type: "TEXT", // Default Media Receiver currently only supports TEXT
      trackContentId: subtitle.fullPath.replace("localhost", networkAddress), // the URL of the VTT (enabled CORS and the correct ContentType are required)
      trackContentType: "text/vtt", // Currently only VTT is supported
      name: subtitle.language, // a Name for humans
      language: subtitle.language, // the language
      subtype: "SUBTITLES", // should be SUBTITLES
    }));

    await new Promise((resolve, reject) => {
      if (!this.selectedDevice) {
        throw new Error("No device selected");
      }

      client.connect(this.selectedDevice.address, () => {
        client.launch(DefaultMediaReceiver, (err?: Error, player?: Player) => {
          if (err) throw err;
          if (!player) throw new Error("Player not set");

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
              title: item.title,
              images: [
                {
                  url: item.images.poster?.full || "",
                },
                {
                  url: item.images.fanart?.full || "",
                },
              ],
            },
          };

          player.load(
            media,
            { autoplay: true, activeTrackIds: tracks.map((e) => e.trackId) },
            (_err?: Error) => {
              if (_err) reject(_err);
              resolve();
            }
          );
        });
      });
    });
  }
}
