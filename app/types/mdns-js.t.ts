declare module "mdns-js" {
  import { EventEmitter } from "events";

  export interface Browser extends EventEmitter {
    start: () => void;
    stop: () => void;
    discover: () => void;
  }

  export function createBrowser(Item: string): Browser;
  export function tcp(name: string): string;
}
