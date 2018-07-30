import { Selector } from 'testcafe';
import {
  BASE_URL,
  cardSelector,
  cardlistSelector,
  titleSelector,
  getPageUrl,
  clearConfigs
} from './helpers';

const TEST_MOVIE_URL = '#/item/movies/351286';

fixture`Item Page`.page(BASE_URL).beforeEach(async t => {
  clearConfigs();
  await t
    .click(Selector('a').withExactText('Home'))
    .typeText('#pct-search-input', 'jurassic world', { replace: true })
    .pressKey('enter')
    .click(cardSelector);
});

test('it should load item title', async t => {
  await t
    .expect(
      Selector('h1').withExactText('Jurassic World: Fallen Kingdom').visible
    )
    .ok();
});

test('it should go back', async t => {
  await t
    .click('[data-e2e="item-button-back"]')
    .expect(getPageUrl())
    .contains('search')
})

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
