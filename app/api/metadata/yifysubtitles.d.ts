declare module "@amilajack/yifysubtitles" {
  export interface YifySubtitle {
    langShort: string;
    filename: string;
  }
  export interface Opts {
    path?: string;
    langs?: string[];
  }
  export default function yifysubtitles(
    itemId: string,
    opts?: Opts
  ): Promise<YifySubtitle[]>;
}
