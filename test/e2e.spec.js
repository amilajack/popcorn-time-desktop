// A simple test to verify a visible window is opened with a title
import path from 'path';
import os from 'os';
import { Application } from 'spectron';
import electronPrebuilt from 'electron';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const app = new Application({
  path: electronPrebuilt,
  args: [path.join(__dirname, '..', 'app')],
  waitTimeout: 2000
});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('e2e', function testApp() {
  // Constructs url similar to file:///Users/john/popcorn-desktop-experimental/app/app.html#/${url}
  const navigate = url =>
    this.app.client.url(`file://${process.cwd()}/app/app.html#/${url}`);

  const findCardList = () => this.app.client.waitForVisible('.CardList');
  const findCard = () => this.app.client.waitForVisible('.Card');

  beforeAll(async () => {
    this.app = await app.start();
  });

  afterAll(() => {
    if (this.app && this.app.isRunning()) {
      this.app.stop();
    }
  });

  describe('main window', () => {
    it('should open window', async () => {
      const title = await this.app.client.getTitle();
      expect(title).toBe('Popcorn Time');
    });
  });

  describe('HomePage', () => {
    beforeEach(async () => {
      await navigate('');
      await delay(2000);
    });

    it('should display CardList', async () => {
      const cardListIsDisplayed = await findCardList().isVisible('.CardList');
      const cardIsDisplayed = await findCard().isVisible('.CardList');
      expect(cardListIsDisplayed).toBe(true);
      expect(cardIsDisplayed).toBe(true);
    });

    it('should search items', async () => {
      await this.app.client
        .setValue('.navbar input', 'harry potter')
        .keys('Enter');

      await this.app.client.waitUntilWindowLoaded(); // await search results();
      await delay(3000);

      const movieTitles = await this.app.client.getText('.Card .Card--title');
      expect(movieTitles[0]).toContain('Harry Potter');
      expect(movieTitles[1]).toContain('Harry Potter');
      expect(movieTitles[2]).toContain('Harry Potter');

      await this.app.client
        .setValue('.navbar input', 'Lord of the Rings')
        .keys('Enter');

      await this.app.client.waitUntilWindowLoaded(); // await search results();
      await delay(3000);

      const secondMovieTitles = await this.app.client.getText(
        '.Card .Card--title'
      );
      expect(secondMovieTitles[0]).toContain('Lord');
      expect(secondMovieTitles[1]).toContain('Lord');
      expect(secondMovieTitles[2]).toContain('Lord');
    });

    it('should navigate to item on CardList click', async () => {
      await this.app.client.waitForVisible('.CardList').click('.Card');

      await this.app.client.waitUntilWindowLoaded();
      await delay(2000);

      const [titleText] = await this.app.client.getText('#title');
      const [summaryText] = await this.app.client.getText('#summary');
      expect(typeof titleText).toBe('string');
      expect(typeof summaryText).toBe('string');
    });

    it('should navigate between movies and shows', async () => {
      if (os.type() === 'Windows_NT') {
        return; // HACK: Temporary workaround for skipping on windows
      }
      await this.app.client.click('.nav-item:nth-child(2) .nav-link');
      await this.app.client.waitUntilWindowLoaded();
      await delay(2000);
      const cardLinks = await this.app.client.getAttribute('.Card a', 'href');
      expect(cardLinks[0]).toContain('item/shows');
    });

    it('should paginate items on scroll to bottom of viewport', async () => {
      const firstCardLinks = await this.app.client.getAttribute(
        '.Card a',
        'href'
      );
      await this.app.client.scroll('.Loader');
      await delay(2000);
      await this.app.client.waitUntilWindowLoaded();
      const secondCardLinks = await this.app.client.getAttribute(
        '.Card a',
        'href'
      );
      expect(secondCardLinks.length).toBeGreaterThan(firstCardLinks.length);
    });
  });

  describe('ItemPage', () => {
    beforeEach(async () => {
      await this.app.client.waitForVisible('.CardList').click('.Card');
      await this.app.client.waitUntilWindowLoaded();
      await delay(2000);
    });

    it('should navigate to similar cards on click', async () => {
      const [firstTitleText] = await this.app.client.getText('#title');
      const [firstSummaryText] = await this.app.client.getText('#summary');

      await this.app.client.click('.CardList .Card--overlay:first-child');
      await this.app.client.waitUntilWindowLoaded();
      await delay(2000);

      const [secondTitleText] = await this.app.client.getText('#title');
      const [secondSummaryText] = await this.app.client.getText('#summary');

      expect(typeof firstTitleText).toBe('string');
      expect(typeof firstSummaryText).toBe('string');
      expect(typeof secondTitleText).toBe('string');
      expect(typeof secondSummaryText).toBe('string');
      expect(firstTitleText).not.toBe(secondTitleText);
      expect(firstSummaryText).not.toBe(secondSummaryText);
    });
  });
});
