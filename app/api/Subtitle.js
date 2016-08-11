import path from 'path';
import url from 'url';
import os from 'os';
import fs from 'fs';
import srt2vtt from 'srt2vtt';
import rndm from 'rndm';
import download from 'download';
import http from 'http';


const port = 1212;

/**
 * 1. Download srt
 * 2. Convert srt to vtt
 * 3. Serve file with vtt encoding and Content-Type
 * 4. Stop server when done
 */
export default class Subtitle {

  /**
   * @param {string} file | The path to a srt file
   */
  async start() {
    this.server = http.createServer(async (req, res) => {
      const params = url.parse(req.url, true).query;

      if (!params.srtUrl) {
        throw new Error('"srtUrl" query param not provided');
      }

      if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      }

      res.writeHead(200, {
        'Content-Type': 'text/vtt'
      });

      console.log('writing head');

      const { buffer } = await convertSubtitlesFromUrl(
        'http://dl.opensubtitles.org/en/download/src-api/vrf-19f00c62/sid-9762j5nq6vsvu4tf83bnhenqu5/filead/1951988772'
      );
      // const { buffer } = await convertSubtitlesFromUrl(params.srtUrl);

      res.end(buffer);
    })
    .listen(port, 'localhost', error => {
      if (error) {
        return console.error(error);
      }

      return console.info(`Subtitle Server Listening at http://localhost:${port}`);
    });
  }

  stop(cb) {
    this.server.close(() => {
      if (cb) {
        cb();
      }
    });
  }
}

export function convertSubtitlesFromUrl(srtUrl) {
  const randomString = rndm(16);
  const basePath = os.tmpdir();

  const input = path.join(basePath, `${randomString}.srt`);
  const output = path.join(basePath, `${randomString}.vtt`);

  return new Promise((resolve, reject) => {
    download(srtUrl).then(data => {
      fs.writeFileSync(input, data);

      const srtBuffer = fs.readFileSync(input);

      srt2vtt(srtBuffer, (error, vttBuffer) => {
        if (error) reject(error);
        fs.writeFileSync(output, vttBuffer);

        resolve({
          filename: output,
          buffer: vttBuffer
        });
      });
    });
  });
}

export function convertSubtitlesFromBuffer(srtBuffer) {
  const randomString = rndm(16);
  const basePath = os.tmpdir();
  const output = path.join(basePath, `${randomString}.vtt`);

  return new Promise((resolve, reject) => {
    srt2vtt(srtBuffer, (error, vttBuffer) => {
      if (error) reject(error);
      fs.writeFileSync(output, vttBuffer);

      resolve({
        filename: output,
        buffer: vttBuffer
      });
    });
  });
}
