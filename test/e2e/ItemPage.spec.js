import { Selector } from 'testcafe';
import {
  cardSelector,
  cardlistSelector,
  titleSelector,
  getPageUrl
} from './helpers';

const TEST_MOVIE_URL = '#/item/movies/351286';

fixture`Item Page`.page(`../../app/app.html${TEST_MOVIE_URL}`);

test('it should load item title', async t => {
  await t
    .expect(
      Selector('h1').withExactText('Jurassic World: Fallen Kingdom').visible
    )
    .ok();
});

test.skip('it should load similar cards', async t => {
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
