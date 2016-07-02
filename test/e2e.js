/**
 * @todo: find an alternative to webdriver.
 */

/* eslint no-unused-expressions: 0, new-cap: 0 */
import path from 'path';
import chromedriver from 'chromedriver';
import webdriver from 'selenium-webdriver';
import { expect } from 'chai';
import electronPath from 'electron-prebuilt';

chromedriver.start(); // on port 9515
process.on('exit', chromedriver.stop);

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('main window', function spec() {
  this.timeout(5000);

  before(async () => {
    await delay(1000); // wait chromedriver start time
    this.driver = new webdriver.Builder()
      .usingServer('http://localhost:9515')
      .withCapabilities({
        chromeOptions: {
          binary: electronPath,
          args: [`app=${path.resolve()}`]
        }
      })
      .forBrowser('electron')
      .build();
  });

  const test = this;
  const findCardList = () => this.driver.findElement(webdriver.By.className('CardList'));
  const findCard = () => this.driver.findElement(webdriver.By.className('Card'));
  const findMovie = () => this.driver.findElement(webdriver.By.className('Movie'));

  after(async (done) => {
    await this.driver.quit();
    done();
  });

  it('should open window', async (done) => {
    try {
      const title = await this.driver.getTitle();
      expect(title).to.equal('Popcorn Time');
      done();
    } catch (err) {
      done(err);
    }
  });

  it('should display card list', async function cardListTest(done) {
    try {
      this.timeout(10000);

      await delay(1000);
      const cardListIsDisplayed = await findCardList().isDisplayed();
      const cardIsDisplayed = await findCard().isDisplayed();
      expect(cardListIsDisplayed).to.equal(true);
      expect(cardIsDisplayed).to.equal(true);
      done();
    } catch (err) {
      done(err);
    }
  });

  /**
   * @todo: write test that navigates to '/item/tt0816692' and asserts .Movie isDisplayed
   */
  // it('should display movie and torrent data', async function(done) {
  //
  // });
});
