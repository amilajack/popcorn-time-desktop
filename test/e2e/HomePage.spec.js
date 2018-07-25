import { Selector } from 'testcafe';
import {
  getPageTitle,
  getPageUrl,
  cardlistSelector,
  cardSelector,
  scrollBottom
} from './helpers';

fixture
  `Home Page`
  .page('../../app/app.html');

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
    .pressKey('enter')
    .wait(3000)
    .expect((await cardSelector.find('.Card--title').nth(0).innerText).toLowerCase())
    .contains('harry potter')

    await t
    .typeText('#pct-search-input', 'lord of the rings')
    .pressKey('enter')
    .wait(3000)
    .expect((await cardSelector.find('.Card--title').nth(0).innerText).toLowerCase())
    .contains('lord of the rings')
});

test('it should navigate to item on CardList click', async t => {
  await t
    .click(cardSelector)
    .expect(getPageUrl())
    .contains('#/item/movies/')
    .expect(Selector('#title').visible)
    .ok()
    .expect(Selector('#summary').visible)
    .ok();
});

test('should navigate between movies and shows', async t => {
  await t
    .click(Selector('a').withExactText('TV Shows'))
    .expect(getPageUrl())
    .contains('#/item/shows')
    .click(Selector('a').withExactText('Movies'))
    .expect(getPageUrl())
    .contains('#/item/movies');
});

test('should paginate items on scroll to bottom of viewport', async t => {
  await t
    .click(Selector('a').withExactText('Movies'))

  const selector1 = await Selector('.Card a').count;
  await scrollBottom();
  await t
    .expect(Selector('.Loader').visible)
    .notOk()
    .wait(3000);
  const selector2 = await Selector('.Card a').count;

  await t
    .expect(selector1)
    .lt(selector2);
});
