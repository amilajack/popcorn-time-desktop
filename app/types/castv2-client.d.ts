/* eslint max-classes-per-file: off */
declare module "castv2-client" {
  interface Arg {
    autoplay: boolean;
    activeTrackIds: number[];
  }

  interface Player {
    load(item: Record<string, any>, arg: Arg, fn: (err?: Error) => void): void;
  }

  export class DefaultMediaReceiver {}

  export class Client {
    connect(address: string, fn: () => void): void;

    launch(
      address: DefaultMediaReceiver,
      fn: (err?: Error, player?: Player) => void
    ): void;
  }
}
