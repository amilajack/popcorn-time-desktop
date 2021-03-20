declare module "speedtest-net" {
  import { EventEmitter } from "events";

  export default function speedTest(args: { maxTime?: number }): EventEmitter;
}
