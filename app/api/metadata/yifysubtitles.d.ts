declare module "@amilajack/yifysubtitles" {
  export interface YifySubtitle {
    lang: string;
    langShort: string;
    path: string;
    fileName: string;
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
