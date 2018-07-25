import os from 'os';
// import path from 'path';
import { ClientFunction, Selector } from 'testcafe';
// import { expect } from 'chai';

fixture
  `Home Page`.page('../../app/app.html');

const getPageTitle = ClientFunction(() => document.title);
const getPageUrl = ClientFunction(() => window.location.href);
const cardlistSelector = Selector('.CardList');
const cardSelector = Selector('.Card');

test('it should have the expected title', async t => {
  await t.expect(getPageTitle()).eql('Popcorn Time');
});

test('it should display cards list and cards', async t => {
  await t
    .expect(cardlistSelector.visible).ok()
    .expect(cardSelector.visible).ok();
})

test('it should search items', async t => {
  await t
    .typeText('#pct-search-input', 'harry potter')
    .pressKey('enter');

  const cardTitles = await cardSelector.find('.Card--title');
  // console.log(cardTitles)

  // expect(movieTitles[0]).toContain('Harry Potter');
  // expect(movieTitles[1]).toContain('Harry Potter');
  // expect(movieTitles[2]).toContain('Harry Potter');

  await t
    .typeText('#pct-search-input', 'Lord of the Rings')
    .pressKey('enter');

  // expect(secondMovieTitles[0]).toContain('Lord');
  // expect(secondMovieTitles[1]).toContain('Lord');
  // expect(secondMovieTitles[2]).toContain('Lord');
});

test('it should navigate to item on CardList click', async t => {
  await t
    .click(cardSelector)
    .expect(getPageUrl())
    .contains('/item/')
    .expect(Selector('#title').visible)
    .ok()
    .expect(Selector('#summary').visible)
    .ok();
  // const [titleText] = await this.app.client.getText('#title');
  // const [summaryText] = await this.app.client.getText('#summary');
  // expect(typeof titleText).toBe('string');
  // expect(typeof summaryText).toBe('string');
});

test('should navigate between movies and shows', async t => {
  if (os.type() === 'Windows_NT') {
    return; // HACK: Temporary workaround for skipping on windows
  }
  await t
    .click(Selector('a').withExactText('TV Shows'))
    .expect(getPageUrl())
    .contains('item/shows')
    .click(Selector('a').withExactText('Movies'))
    .expect(getPageUrl())
    .contains('item/movies');
  // const cardLinks = await t.getAttribute('.Card a', 'href');
  // expect(cardLinks[0]).toContain('item/shows');
});

test('should paginate items on scroll to bottom of viewport', async t => {
  await t
    .click('.nav-item:nth-child(2) .nav-link');

  const selector1 = await Selector('.Card a');

  await t
    .hover('.Loader')
    .expect(Selector('.Loader').visible)
    .notOk();

  const selector2 = await Selector('.Card a');

  await t
    .expect(selector1.length)
    .notEql(selector2.length);
});
