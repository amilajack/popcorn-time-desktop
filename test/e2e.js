// A simple test to verify a visible window is opened with a title
import { Application } from 'spectron';
import path from 'path';
import { expect } from 'chai';


const app = new Application({
  path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
  args: [
    path.join(__dirname, '..', 'app')
  ],
  waitTimeout: 5000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('e2e', function testApp() {
  const findCardList = () => this.app.client.waitForVisible('.CardList');
  const findCard = () => this.app.client.waitForVisible('.Card');
  const findMovie = () => this.app.client.waitForVisible('.Movie');

  before(async () => {
    this.app = await app.start();
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
      } catch (err) {
        done(err);
      }
    });
  });

  describe('HomePage', () => {
    it('should display CardList', async function cardListTest(done) {
      try {
        const cardListIsDisplayed = await findCardList().isVisible('.CardList');
        const cardIsDisplayed = await findCard().isVisible('.CardList');
        expect(cardListIsDisplayed).to.equal(true);
        expect(cardIsDisplayed).to.equal(true);
        done();
      } catch (err) {
        done(err);
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

        await this.app.client.back();
        await delay(2000); // await HomePage movies to load
        done();
      } catch (err) {
        done(err);
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

        await this.app.client.back();
        await delay(2000); // wait for HomePage movies to load
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should navigate between movies and shows', async done => {
      try {
        await this.app.client.click('.nav-item:nth-child(2) .nav-link');
        await delay(2000);
        const cardLinks = await this.app.client.getAttribute('.Card a', 'href');
        expect(cardLinks[0]).to.include('item/shows');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should paginate items on scroll to bottom of viewport', async done => {
      try {
        const firstCardLinks = await this.app.client.getAttribute('.Card a', 'href');
        await delay(2000);
        await this.app.client.scroll('.Loader');
        await delay(2000);
        const secondCardLinks = await this.app.client.getAttribute('.Card a', 'href');
        expect(secondCardLinks.length).to.be.greaterThan(firstCardLinks.length);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe('MoviePage', () => {
    before(async done => {
      try {
        await delay(2000);

        await this.app.client
          .click('.Card--overlay:first-child')
          .waitForVisible('.Movie');

        await delay(2000);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should navigate to similar cards on click', async done => {
      try {
        const [firstTitleText] = await this.app.client.getText('.Movie h1');
        const [firstSummaryText] = await this.app.client.getText('.Movie h6');

        this.app.client.click('.CardList .Card--overlay:first-child');

        await delay(2000);

        const [secondTitleText] = await this.app.client.getText('.Movie h1');
        const [secondSummaryText] = await this.app.client.getText('.Movie h6');

        expect(firstTitleText).to.be.a('string');
        expect(firstSummaryText).to.be.a('string');
        expect(secondTitleText).to.be.a('string');
        expect(secondSummaryText).to.be.a('string');
        expect(firstTitleText).to.not.equal(secondTitleText);
        expect(firstSummaryText).to.not.equal(secondSummaryText);
        done();
      } catch (err) {
        done(err);
      }
    });

    /**
     * @todo
     */
    // it('should play episode', async done => {
    //   try {
    //     await this.app.client.click('.Movie button:nth-child(2)'); // click 1080p play button
    //     await delay(20000);
    //     done();
    //   } catch (err) {
    //     done(err);
    //   }
    // });
  });
});
