// A simple test to verify a visible window is opened with a title
import { Application } from 'spectron';
import path from 'path';
import { expect } from 'chai';


const app = new Application({
  path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
  args: [
    path.join(__dirname, '..')
  ],
  waitTimeout: 10000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('main window', function testApp() {
  this.timeout(10000);

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

  it('should open window', async (done) => {
    try {
      const title = await this.app.client.getTitle();
      expect(title).to.equal('Popcorn Time');
      done();
    } catch (err) {
      done(err);
    }
  });

  it('should display card list', async function cardListTest(done) {
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

  it('should navigate to item on CardList click', async done => {
    try {
      const isVisible = await this.app.client
        .click('.Card--overlay')
        .waitForVisible('.Movie')
        .isVisible('.Movie');
      expect(isVisible).to.equal(true);

      const [titleText] = await this.app.client.getText('.Movie h1');
      expect(titleText).to.be.a('string');
      done();
    } catch (err) {
      done(err);
    }
  });

  it('should navigate to similar cards on click', async done => {
    try {
      const [firstTitleText] = await this.app.client.getText('.Movie h1');
      const [firstParagraphText] = await this.app.client.getText('.Movie h6');
      expect(firstTitleText).to.be.a('string');
      expect(firstParagraphText).to.be.a('string');

      this.app.client.click('.CardList .Card--overlay');

      await delay(3000);

      const [secondTitleText] = await this.app.client.getText('.Movie h1');
      const [secondParagraphText] = await this.app.client.getText('.Movie h6');

      expect(secondTitleText).to.be.a('string');
      expect(secondParagraphText).to.be.a('string');
      expect(firstTitleText).to.not.equal(secondParagraphText);
      expect(firstParagraphText).to.not.equal(secondParagraphText);
      done();
    } catch (err) {
      done(err);
    }
  });
});
