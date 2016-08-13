import express from 'express';
import path from 'path';
import os from 'os';
import fs from 'fs';
import srt2vtt from 'srt2vtt';
import rndm from 'rndm';


export const basePath = os.tmpdir();
export const port = process.env.SUBTITLES_PORT || 4000;

/**
 * Serve the file through http
 */
export function startServer() {
  const server = express();
  server.use(express.static(basePath));
  server.listen(port);

  console.info(`Listening at http://localhost:${port}, serving ${basePath}`);

  return server;
}

export function closeServer(server) {
  return server.close();
}

export function convertFromBuffer(srtBuffer) {
  const randomString = rndm(16);
  const filename = `${randomString}.vtt`;
  const fullPath = path.join(basePath, filename);

  return new Promise((resolve, reject) => {
    srt2vtt(srtBuffer, (error, vttBuffer) => {
      if (error) reject(error);

      console.info({ fullPath });

      fs.writeFileSync(fullPath, vttBuffer);

      resolve({
        filename,
        basePath,
        port,
        fullPath,
        buffer: vttBuffer
      });
    });
  });
}
