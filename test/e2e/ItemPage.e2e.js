import { Selector } from 'testcafe';
import { ReactSelector, waitForReact } from 'testcafe-react-selectors';
import {
  BASE_URL,
  cardSelector,
  cardlistSelector,
  titleSelector,
  getPageUrl,
  clearConfigs,
  clickItemPageBackButton,
  navigateTo,
  getLowerCaseCardTitle
} from './helpers';

const TEST_MOVIE_URL = '#/item/movies/351286';

fixture`Item Page Movies`.page(BASE_URL).beforeEach(async t => {
  clearConfigs();
  await t
    .click(Selector('a').withExactText('Home'))
    .typeText('#pct-search-input', "harry potter and the philosopher's stone", {
      replace: true
    })
    .pressKey('enter')
    .click(cardSelector);
});

test('it should load item title', async t => {
  await t
    .expect(
      Selector('h1').withExactText("Harry Potter and the Philosopher's Stone")
        .visible
    )
    .ok();
});

test('it should go back', async t => {
  await clickItemPageBackButton(t);
  await t
    .expect(await getPageUrl().then(str => str.slice(str.length - 11)))
    .eql('app.html?#/');
});

test('it should load similar cards', async t => {
  await t
    .click(cardlistSelector.find('.Card'))
    .expect(getPageUrl())
    .notContains(TEST_MOVIE_URL)
    .expect(cardSelector.visible)
    .ok()
    .expect(cardlistSelector.visible)
    .ok()
    .expect(titleSelector.visible)
    .ok();
});

test('it should add items to favorites', async t => {
  await t.click('.SaveItem--favorites');
  await clickItemPageBackButton(t);
  await navigateTo(t, 'home');
  await t
    .expect(await getLowerCaseCardTitle())
    .contains("harry potter and the philosopher's stone")
    .click(cardSelector)
    .expect(getPageUrl())
    .contains('item/');
});

test('it should add items to watch list', async t => {
  await t.click('.SaveItem--watchlist');
  await clickItemPageBackButton(t);
  await navigateTo(t, 'home');
  await t
    .expect(await getLowerCaseCardTitle())
    .contains("harry potter and the philosopher's stone")
    .click(cardSelector)
    .expect(getPageUrl())
    .contains('item/');
});

test.skip('it should add items to recently watched list', async t => {
  await t
    .click('[data-e2e="item-play-button"]')
    .wait(20000)
    .click('[data-e2e="close-player"]');

  await clickItemPageBackButton(t);
  await navigateTo(t, 'home');
  await t
    .expect(await getLowerCaseCardTitle())
    .contains("harry potter and the philosopher's stone")
    .click(cardSelector)
    .expect(getPageUrl())
    .contains('item/');
});

test('it should display torrent loading status', async t => {
  await t.expect(Selector('[data-e2e="item-play-button"]').visible).ok();
});

test.skip('it should play trailer', async t => {
  await t
    .click('[data-e2e="item-trailer-button"]')
    .expect(Selector('.plyr').visible)
    .ok();
});

test('it should click player dropdown menu', async t => {
  await waitForReact();
  await t
    .click(ReactSelector('DropdownToggle'))
    .click(
      ReactSelector('DropdownItem').withProps({
        id: 'vlc'
      })
    )
    .expect(ReactSelector('Button').withExactText('vlc').visible)
    .ok();
});

test('it should load and play a movie', async t => {
  const playButton = Selector('[data-e2e="item-play-button"]');
  // Navigate to harry potter because we know it has a lot of torrents. Good for testing purposes
  await t
    .expect(Selector('[data-e2e="item-play-button"]').visible)
    .ok()
    .expect(playButton.visible)
    .ok()
    .click(playButton)
    .expect(
      Selector('.Item--loading-status').withExactText('Loading torrent...')
        .visible
    )
    .ok()
    .expect(Selector('[data-e2e="item-year"]').withExactText('2001').visible)
    .ok();
});

fixture`Item Page TV Shows`.page(BASE_URL).beforeEach(async t => {
  clearConfigs();
  await t
    .click(Selector('a').withExactText('Home'))
    .typeText('#pct-search-input', 'silicon valley', { replace: true })
    .pressKey('enter')
    .click(cardSelector)
    .expect(Selector('[data-e2e="item-year"]').withExactText('2014').visible)
    .ok();
});

test.skip('it should load and play a tv show', async t => {
  const playButton = Selector('[data-e2e="item-play-button"]');
  // Navigate to harry potter because we know it has a lot of torrents. Good for testing purposes
  await t
    .expect(Selector('[data-e2e="item-play-button"]').visible)
    .ok()
    .notOk()
    .expect(playButton.visible)
    .ok()
    .click(playButton)
    .expect(
      Selector('.Item--loading-status').withExactText('Loading torrent...')
        .visible
    )
    .ok()
    .expect(Selector('a').withExactText('').visible)
    .ok();
});

test('it should move card selector left and right', async t => {
  await t
    .pressKey('right')
    .expect(
      Selector('.Card')
        .nth(1)
        .withAttribute('class', 'Card Card--selected').visible
    )
    .ok()
    .pressKey('left')
    .expect(
      Selector('.Card')
        .nth(0)
        .withAttribute('class', 'Card Card--selected').visible
    )
    .ok()
    .pressKey('left')
    .expect(
      Selector('.Card')
        .nth(0)
        .withAttribute('class', 'Card Card--selected').visible
    )
    .ok();
});

test('it should navigate to card on enter press', async t => {
  const url = await getPageUrl();
  await t
    .pressKey('right')
    .expect(
      Selector('.Card')
        .nth(1)
        .withAttribute('class', 'Card Card--selected').visible
    )
    .ok()
    .pressKey('enter')
    .expect(getPageUrl())
    .notEql(url);
});
