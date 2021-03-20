import express from "express";
import os from "os";
import getPort from "get-port";

export type Subtitle = {
  default: boolean;
  filename: string;
  basePath: string;
  port: number;
  fullPath: string;
  language: string;
};

/**
 * The subtitles for the player
 * These are different from the subtitles from the API
 */

export default class SubtitleServer {
  basePath = os.tmpdir();

  server?: Express.Application;

  port?: number;

  async startServer(): Promise<void> {
    // Find a port at runtime. Default to 4000 if it is available
    this.port = process.env.SUBTITLES_PORT
      ? parseInt(process.env.SUBTITLES_PORT, 10)
      : await getPort({ port: 4_000 });

    // Start the static file server for the subtitle files
    const server = express();
    // Enable CORS
    // https://github.com/thibauts/node-castv2-client/wiki/How-to-use-subtitles-with-the-DefaultMediaReceiver-app#subtitles
    server.use((req, res, next) => {
      if (req.headers.origin) {
        res.headers["Access-Control-Allow-Origin"] = req.headers.origin;
      }
      next();
    });
    server.use(express.static(this.basePath));
    this.server = server.listen(this.port);

    console.info(
      `Subtitle server serving on http://localhost:${this.port}, serving ${this.basePath}`
    );
  }

  closeServer() {
    if (this.server) {
      this.server.close();
    }
  }
}

export const languages = [
  // 'sq',
  "ar",
  // 'bn',
  // 'pb',
  // 'bg',
  "zh",
  // 'hr',
  // 'cs',
  // 'da',
  // 'nl',
  "en",
  // 'et',
  // 'fa',
  // 'fi',
  // 'fr',
  // 'de',
  // 'el',
  // 'he',
  // 'hu',
  // 'id',
  // 'it',
  // 'ja',
  // 'ko',
  // 'lt',
  // 'mk',
  // 'ms',
  // 'no',
  // 'pl',
  // 'pt',
  // 'ro',
  "ru",
  // 'sr',
  // 'sl',
  "es",
  // 'sv',
  // 'th',
  // 'tr',
  // 'ur',
  // 'uk',
  // 'vi'
];
