// A simple test to verify a visible window is opened with a title
import { Application } from 'spectron';
import path from 'path';
import { expect } from 'chai';
import resemble from 'resemblejs';
import fs from 'fs';


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

  describe('main window', () => {
    it('should open window', async done => {
      try {
        const title = await this.app.client.getTitle();
        expect(title).to.equal('Popcorn Time');
        done();
      } catch (error) {
        done(error);
      }
    });
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

    it('should display CardList', async function cardListTest(done) {
      try {
        const cardListIsDisplayed = await findCardList().isVisible('.CardList');
        const cardIsDisplayed = await findCard().isVisible('.CardList');
        expect(cardListIsDisplayed).to.equal(true);
        expect(cardIsDisplayed).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should search items', async done => {
      try {
        await this.app.client
          .setValue('.navbar input', 'harry potter')
          .click('.navbar button');

        await delay(2000); // await search results

        const movieTitles = await this.app.client.getText('.Card .Card--title');
        expect(movieTitles[0]).to.include('Harry Potter');
        expect(movieTitles[1]).to.include('Harry Potter');
        expect(movieTitles[2]).to.include('Harry Potter');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should navigate to item on CardList click', async done => {
      try {
        const isVisible = await this.app.client
          .click('.Card--overlay:first-child')
          .waitForVisible('.Movie')
          .isVisible('.Movie');
        expect(isVisible).to.equal(true);

        await delay(2000);

        const [titleText] = await this.app.client.getText('.Movie h1');
        expect(titleText).to.be.a('string');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should navigate between movies and shows', async done => {
      try {
        await this.app.client.click('.nav-item:nth-child(2) .nav-link');
        await delay(2000);
        const cardLinks = await this.app.client.getAttribute('.Card a', 'href');
        expect(cardLinks[0]).to.include('item/shows');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('MoviePage', () => {
    beforeEach(async done => {
      try {
        // navigate to Game of thrones
        await navigate('item/shows/tt0944947');
        await this.app.client.waitForVisible('.Movie');
        await delay(2000);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  
  describe('Screenshots', () => {
    beforeEach(async done => {
      try {
        // navigate to homepage (Movie Page)
        await navigate('');
        await this.app.client.waitForVisible('.Movie');
        this.app.browserWindow.capturePage().then(imageBuffer => {
          fs.writeFile('./screenshots/page.png', imageBuffer);
        });
        done();
      } catch (error) {
        done(error);
      }
    });
    
    it('should match the control homepage screenshot', async done => {
      try {
        const diff = resemble('./screenshots/page.png')
          .compareTo('./screenshots/base-homepage.png')
          .ignoreColors()
          .onComplete(data => {
            console.log(data.misMatchPercentage);
            return data.misMatchPercentage;
          });
        await delay(2000);
        expect(diff).to.equal(100);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
