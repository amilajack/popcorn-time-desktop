/**
 * Screenshot tests
 *
 * This file needs to be separate from e2e because the app needs to be recompiled
 * separeately with the flag API_USE_MOCK_DATA
 */
import path from 'path';
import fs from 'fs';
import { Application } from 'spectron';
import imageDiff from 'image-diff';
import gm from 'gm';
import electronPrebuilt from 'electron';

const app = new Application({
  path: electronPrebuilt,
  args: [path.join(__dirname, '..', 'app')],
  waitTimeout: 2000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('screenshot', function testApp() {
  // Constructs url similar to file:///Users/john/popcorn-desktop-experimental/app/app.html#/${url}
  const navigate = url =>
    this.app.client.url(`file://${process.cwd()}/app/app.html#/${url}`);

  beforeAll(async () => {
    this.app = await app.start();
  });

  afterAll(() => {
    if (this.app && this.app.isRunning()) {
      this.app.stop();
    }
  });

  describe('HomePage', () => {
    beforeEach(async () => {
      await navigate('');
      await delay(2000);
    });

    it('should display CardList', async () => {
      await screenshotTest(this.app, 'CardList');
    });
  });

  describe('ItemPage', () => {
    beforeEach(async () => {
      await navigate('item/shows/tt0944947');
      await delay(2000);
    });

    it('should display Movie', async () => {
      await screenshotTest(this.app, 'ItemPage', 0.3);
    });
  });
});

async function screenshotTest(_app, filename, differencePercentage = 0.2) {
  const diff = await handleScreenshot(_app, filename);
  // Allow 10% of pixels to be different by default
  expect(diff)
    .toHavePropertys('percentage')
    .toBeLessThan(differencePercentage);
}

async function handleScreenshot(_app, filename) {
  // Check if the file exists
  const hasExpectationScreenshot = await new Promise(resolve => {
    fs.access(`./test/screenshots/${filename}.png`, error => {
      if (error) {
        return resolve(false);
      }
      return resolve(true);
    });
  });

  if (hasExpectationScreenshot) {
    return compareScreenshot(_app, filename);
  }

  console.log('Does not have screenshot');
  await capturePage(_app, filename, './test/screenshots');
  return compareScreenshot(_app, filename);
}

async function capturePage(_app, filename, basePath) {
  const imageMagickSubClass = gm.subClass({ imageMagick: true });

  const imageBuffer = await app.browserWindow.capturePage();
  await imageMagickSubClass(imageBuffer)
    .resize(800)
    .write(`${basePath}/${filename}.png`, error => {
      if (error) console.log(error);
    });
}

async function compareScreenshot(_app, filename) {
  await capturePage(_app, filename, './.tmp');

  return new Promise((resolve, reject) =>
    imageDiff.getFullResult(
      {
        actualImage: `./.tmp/${filename}.png`,
        expectedImage: `./test/screenshots/${filename}.png`,
        diffImage: './.tmp/difference.png'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    )
  );
}
