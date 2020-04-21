declare module "srt2vtt" {
  export default function srt2vtt(
    srtBuffer: Buffer,
    fn: (error: Error | undefined, vttBuffer: Buffer) => void
  ): void;
}
