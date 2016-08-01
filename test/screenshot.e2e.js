// A simple test to verify a visible window is opened with a title
import path from 'path';
import fs from 'fs';
import { Application } from 'spectron';
import { expect } from 'chai';
import imageDiff from 'image-diff';
import gm from 'gm';


const app = new Application({
  path: require('electron-prebuilt'),
  args: [
    path.join(__dirname, '..', 'app')
  ],
  waitTimeout: 2000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('screenshot', function testApp() {
  this.retries(3);
  this.slow(5000);

  // Constructs url similar to file:///Users/john/popcorn-desktop-experimental/app/app.html#/${url}
  const navigate = url => this.app.client.url(`file://${process.cwd()}/app/app.html#/${url}`);

  const findCardList = () => this.app.client.waitForVisible('.CardList');
  const findCard = () => this.app.client.waitForVisible('.Card');
  const findMovie = () => this.app.client.waitForVisible('.Movie');

  before(async done => {
    try {
      this.app = await app.start();
      done();
    } catch (error) {
      done(error);
    }
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  describe('HomePage', () => {
    beforeEach(async done => {
      try {
        await navigate('');
        await delay(2000);
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should display CardList', async done => {
      try {
        const cardListIsDisplayed = await findCardList().isVisible('.CardList');
        const cardIsDisplayed = await findCard().isVisible('.CardList');
        expect(cardListIsDisplayed).to.equal(true);
        expect(cardIsDisplayed).to.equal(true);

        const diff = await handleScreenshot(this.app, 'CardList');

        // Allow 10% of pixels to be different
        expect(diff).to.have.deep.property('percentage').that.is.below(0.1);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

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
  await capturePage(_app, filename, './tmp');

  return new Promise((resolve, reject) =>
    imageDiff.getFullResult({
      actualImage: `./tmp/${filename}.png`,
      expectedImage: `./test/screenshots/${filename}.png`,
      diffImage: './tmp/difference.png',
    }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    })
  );
}
