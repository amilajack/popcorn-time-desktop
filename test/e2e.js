// A simple test to verify a visible window is opened with a title
import path from 'path';
import os from 'os';
import { Application } from 'spectron';
import { expect } from 'chai';
import electronPrebuilt from 'electron-prebuilt';


const app = new Application({
  path: electronPrebuilt,
  args: [
    path.join(__dirname, '..', 'app')
  ],
  waitTimeout: 2000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('e2e', function testApp() {
  this.retries(3);

  // Constructs url similar to file:///Users/john/popcorn-desktop-experimental/app/app.html#/${url}
  const navigate = url => this.app.client.url(`file://${process.cwd()}/app/app.html#/${url}`);

  const findCardList = () => this.app.client.waitForVisible('.CardList');
  const findCard = () => this.app.client.waitForVisible('.Card');

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
        await delay(3000);
        await this.app.client
          .setValue('.navbar input', 'harry potter')
          .click('.navbar button');

        await this.app.client.waitUntilWindowLoaded(); // await search results();
        await delay(3000);

        const movieTitles = await this.app.client.getText('.Card .Card--title');
        expect(movieTitles[0]).to.include('Harry Potter');
        expect(movieTitles[1]).to.include('Harry Potter');
        expect(movieTitles[2]).to.include('Harry Potter');

        await this.app.client
          .setValue('.navbar input', 'Lord of the Rings')
          .click('.navbar button');

        await this.app.client.waitUntilWindowLoaded(); // await search results();
        await delay(3000);

        const secondMovieTitles = await this.app.client.getText('.Card .Card--title');
        expect(secondMovieTitles[0]).to.include('Lord');
        expect(secondMovieTitles[1]).to.include('Lord');
        expect(secondMovieTitles[2]).to.include('Lord');
        done();
      } catch (error) {
        done(error);
      }
    });

    it.skip('should navigate to item on CardList click', async done => {
      try {
        const isVisible = await this.app.client
          .waitForVisible('.Card--overlay')
          .click('.Card--overlay:first-child')
          .isVisible('.Card--overlay:first-child');

        expect(isVisible).to.equal(true);

        await this.app.client.waitUntilWindowLoaded();

        const [titleText] = await this.app.client.getText('.Movie h1');
        expect(titleText).to.be.a('string');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should navigate between movies and shows', async done => {
      try {
        if (os.type() === 'Windows_NT') {
          return done(); // HACK: Temporary workaround for skipping on windows
        }
        await this.app.client.click('.nav-item:nth-child(2) .nav-link');
        await this.app.client.waitUntilWindowLoaded();
        await delay(2000);
        const cardLinks = await this.app.client.getAttribute('.Card a', 'href');
        expect(cardLinks[0]).to.include('item/shows');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should paginate items on scroll to bottom of viewport', async done => {
      try {
        const firstCardLinks = await this.app.client.getAttribute('.Card a', 'href');
        await this.app.client.scroll('.Loader');
        await delay(2000);
        await this.app.client.waitUntilWindowLoaded();
        const secondCardLinks = await this.app.client.getAttribute('.Card a', 'href');
        expect(secondCardLinks.length).to.be.greaterThan(firstCardLinks.length);
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
        await delay(1000);
        await this.app.client.waitUntilWindowLoaded();
        done();
      } catch (error) {
        done(error);
      }
    });

    it.skip('should navigate to similar cards on click', async done => {
      try {
        const [firstTitleText] = await this.app.client.getText('.Movie h1');
        const [firstSummaryText] = await this.app.client.getText('.Movie h6');

        await this.app.client.click('.CardList .Card--overlay:first-child');
        await this.app.client.waitUntilWindowLoaded();

        const [secondTitleText] = await this.app.client.getText('.Movie h1');
        const [secondSummaryText] = await this.app.client.getText('.Movie h6');

        expect(firstTitleText).to.be.a('string');
        expect(firstSummaryText).to.be.a('string');
        expect(secondTitleText).to.be.a('string');
        expect(secondSummaryText).to.be.a('string');
        expect(firstTitleText).to.not.equal(secondTitleText);
        expect(firstSummaryText).to.not.equal(secondSummaryText);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
